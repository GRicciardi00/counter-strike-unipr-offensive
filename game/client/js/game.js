
var username = " ";

function getname(){ //get username of current player
  username = sessionStorage.getItem("name")
}
getname(); 

//Global variable to control the player that's playing
var current_player =
{
 name: " " , 
 rotation: 0,
 x: 0,
 y: 0,
 playerId: null,
 input: {
   left: false,
   right: false,
   up: false,
   down: false,
   Q: false
 },
 velocity_x: 0,
 velocity_y: 0,
 hp: null,
 ammo: 0,
}


class GameScene extends Phaser.Scene
{
//PRELOAD
//preload function initialize the assets of the game (load images/tileset and sounds)
  constructor()
  {
    super({key: 'game'})
  }
  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('character', 'assets/character.png');
    this.load.image('target', 'assets/target.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('reload', 'assets/reload.png');
    this.load.audio('shot', 'assets/shot_sound.mp3')
    this.load.audio('reload_audio', 'assets/reload_sound.mp3')
    this.load.audio('death', 'assets/death_sound.mp3')
    this.load.audio('hit', 'assets/bullet_sound.mp3')
  }

//CREATE
//create function manage everything needed for the creation of the game
  create() {
    var self = this;
    this.socket = io();  //initialization of socket connection
    current_player.name = username;
    const background = this.add.image(0,0, 'background').setOrigin(0,0); //the map seen by the player is simply an image
    this.reticle =self.physics.add.sprite(400, 300, 'target').setOrigin(0.5, 0.5).setDisplaySize(25, 25); //adding the reticle object
    this.players = this.add.group(); 
    this.bullets = this.add.group(); 
    var style = { font: "16px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" }; // for displaying number of bullets
    this.ammoHUD = self.add.text(0, 0, 5, style);
    this.pum = this.sound.add("shot", { loop: false, volume: 0.7 }); 
    this.reload_audio = this.sound.add("reload_audio", {loop: false, volume: 0.7}); 
    this.ouch = this.sound.add("death",{ loop: false, volume: 0.7 }); 
    this.hit_sound = this.sound.add("hit",{ loop: false, volume: 0.7 } );
    this.cameras.main.setBounds(0,0,2560,1920,true)
    this.cameras.main.zoom = 0.6;
    

    //MANAGEMENT OF SOCKET'S MESSAGES
    //setup of the current player
    //displaying every player
    this.socket.emit('username', current_player.name);
    this.socket.on('current_player', function(player) {
      current_player = player;
    })
    this.socket.on('currentPlayers', function (players) {
      Object.keys(players).forEach(function (id) {
          displayPlayers(self, players[id], 'character'); //definition in utilities.js
          self.players.getChildren().forEach(function (player) {
            if (player.playerId === players[id].playerId){
              player.hp.move(current_player.x,current_player.y);
              player.hp.draw();
            }
            current_player.ammo = 5;
            
            }); 

      });
    
    });

    //adding a player to the game
    this.socket.on('newPlayer', function (playerInfo) {
      displayPlayers(self, playerInfo, 'character'); //definition in utilities.js
      self.players.getChildren().forEach(function (player) 
      {
        player.hp.move(playerInfo.x,playerInfo.y);
        player.hp.draw();

      })
      });
    
    //removing a player from the game when he disconnect
    this.socket.on('remove', function (playerId) {
        self.players.getChildren().forEach(function (player) {
        if (playerId === player.playerId) {
            player.hp.bar.destroy();
            player.destroy();
            player.userHUD.destroy();
      }
    });
  });
  
  //respawning player when they are dead
  this.socket.on('death', function(dead_player,id,name){
    self.ouch.play();    //play death effect
    self.players.getChildren().forEach(function (player) { 
      if (id === player.playerId) { 
          player.x = dead_player.x;
          player.y = dead_player.y;
          player.hp.value = 100;
          player.hp.move(player.x,player.y);
          player.hp.draw();
          player.ammo = 5; 
    }

  });
    
    if(id == current_player.playerId) //updating leaderboard from killed player client
    { 
      $.ajax({
        type: 'POST',  //sending post request for updating deaths
        url: '/submit-deaths',
        data : {
          username: name
        },
        success: function(data){
          //console.log('success')
        },
        error: function (xhr) {
          console.log('error with death update');
        }
        
      }); 
    }
  })
  this.socket.on('udpate-scores', function(id,name){
      if(current_player.playerId==id) //updating leaderboard from killer client
      {
        
        $.ajax({   //sending post request for updating kills
          type: 'POST',
          url: '/submit-scores',
          data : {
            username: name
          },
          success: function(data){
            //console.log('success')
          },
          error: function (xhr) {
            console.log('error with scores update');
          }
        });
      }
    })
  
  //management of playerupdates received by the server: saving info on local variables and updating everything in the phaser function ''update()'' to increase the framerate
  this.socket.on('playerUpdates', function (players) {
    Object.keys(players).forEach(function (id) {
      self.players.getChildren().forEach(function (player) {

        //other players saw by current_player
        if (players[id].playerId === player.playerId) {
          player.targetRotation = players[id].rotation;
          player.targetX = players[id].x;
          player.targetY = players[id].y;
        }
        //setting general info that doesn't effect the phaser engine of current player
        if (players[id].playerId === current_player.playerId){
          current_player.targetX = players[id].x;
          current_player.targetY = players[id].y;
          current_player.velocity_x = players[id].velocity_x;
          current_player.velocity_y = players[id].velocity_y;

          self.ammoHUD.x = players[id].x-25; //-20 x offset from player sprite for ammo HUD
          self.ammoHUD.y = players[id].y+25; //-60 y offset from player sprite for ammo HUD
          
        }
        //setting rotation of current player (working on player)
        if (player.playerId === current_player.playerId) {
          player.rotation = Phaser.Math.Angle.Between(current_player.x, current_player.y, self.reticle.x, self.reticle.y);
          current_player.rotation = player.rotation;
        }

        
      });
    });
  });

  //adding bullets on the screen
  this.socket.on('fire', function(bullet, bullet_id, shotby){
    bullet.shotby = shotby;
    bullet.id = bullet_id;
    displayBullet(self,bullet, 'bullet'); //definition in utilities.js
    self.pum.play();
  })

  //bullet's movemenent management
  this.socket.on('bulletUpdate', function(bullet, bullet_id,shotby){
    bullet.id = bullet_id;
    bullet.shotby = shotby;
    self.bullets.getChildren().forEach(function (displayed_bullet) {
      if (bullet.id === displayed_bullet.id) {
        displayed_bullet.setRotation(bullet.rotation);
        displayed_bullet.setPosition(bullet.x, bullet.y);
        
      }
  })
})

//remove bullet when collide
this.socket.on('destroyBullet', function(bullet_id) 
{
  self.bullets.getChildren().forEach(function (bullet){
     if (bullet_id === bullet.id){
        bullet.destroy();
      }
    })
  
}) 

//decrease player life when get hit
this.socket.on('hit', function(playerHit_id)
  {
    self.hit_sound.play();
    self.players.getChildren().forEach(function (player) {
      if(player.playerId === playerHit_id)
      {
        player.hp.decrease(20); //20 is default damage
      }
    })
  })


  this.socket.on('reload', function(playerid){
        self.reload_audio.play();
        self.players.getChildren().forEach(function (player) {
        if(player.playerId === playerid){
          player.setTexture('reload');  //change texture whilre reloading
          setTimeout(() => {
            current_player.ammo = 5;
            player.setTexture('character');
            self.ammoHUD.setText(current_player.ammo);
          }, 3000) //3000ms default reload time
        }
        })
  })

  
  //Player input inizialization
  this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.leftKeyPressed = false;
  this.rightKeyPressed = false;
  this.upKeyPressed = false;
  this.downKeyPressed = false;

  this.input.on('pointermove', function (pointer) {
    if (this.input.mouse.locked)
    {
        self.reticle.x += pointer.movementX;
        self.reticle.y += pointer.movementY;
  
      var new_rotation = Phaser.Math.Angle.Between(current_player.x, current_player.y, self.reticle.x, self.reticle.y);
      if (new_rotation !== current_player.rotation)
      {
        //if current player rotation is changed send a message
        this.socket.emit('rotation', current_player.rotation, current_player.playerId);
        
      }
        
    }
    
  }, this);

  //Q key for unclock the pointer
  this.input.keyboard.on('keydown_Q', function (event) {
      game.input.mouse.releasePointerLock();
    }, 0, this);

  //ESC key for going back to the menu
    this.input.keyboard.on('keydown_ESC', function (event) {
      if(confirm("Press OK to go back to menu "))
      {
        self.socket.disconnect();
        self.scene.stop();
        self.scene.start('menu'); //call menu scene
      }
      
    }, 0, this);
    
  //left mouse player actions: lock the screen and send shot request to the server
  this.input.on('pointerdown', function () {
    if (!game.input.mouse.locked){
      game.input.mouse.requestPointerLock();
    }
    else{
      if (current_player.ammo!==0)
      { 
      self.socket.emit('shot', self.reticle)
      current_player.ammo --;
      self.ammoHUD.setText(current_player.ammo);  //updating bullet's player HUD
      }

    }
    });

  }

  //UPDATE
  //Update function does everything 60 frames per second 
  update() {
    var left = this.leftKeyPressed;
    var right = this.rightKeyPressed;
    var up = this.upKeyPressed;
    var down = this.downKeyPressed;

    //checking player input
    if (this.keyA.isDown) {
      this.leftKeyPressed = true;

    } else{this.leftKeyPressed = false;}
    if (this.keyD.isDown) {
      this.rightKeyPressed = true;
    } else {
      this.rightKeyPressed = false;
    }
    if (this.keyW.isDown) {
      this.upKeyPressed = true;
    } else {this.upKeyPressed = false;}
    if(this.keyS.isDown){
      this.downKeyPressed = true;
    } 
    else {
      this.downKeyPressed = false;
    }
    //if something is changed send player input to the server
    if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed || down !== this.downKeyPressed) {
    this.socket.emit('playerInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed});
    
    }
    current_player.x = current_player.targetX;
    current_player.y = current_player.targetY;
    //setting position and rotation on the screen of all players    
    this.players.getChildren().forEach(function(player){
      player.setRotation(player.targetRotation);
      player.setPosition(player.targetX, player.targetY);
      player.hp.move(player.x,player.y); 
      player.userHUD.x = player.x-25; //moving the name with the player
      player.userHUD.y = player.y+25;
      if (player.playerId == current_player.playerId)
      {
        player.userHUD.x = player.x-10 //adjusting current_player name on screen
        player.userHUD.setTint(0xffffff) //setting white tint to the write
      }
    })
    this.cameras.main.startFollow(current_player)
    this.reticle.body.velocity.x = current_player.velocity_x;
    this.reticle.body.velocity.y = current_player.velocity_y;

    constrainReticle(this.reticle, 350); //definition in utilities.js

    }
}  
  
  