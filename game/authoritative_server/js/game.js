//global array of players
const players = {};

//setting configurations for server-side phaser game
const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 2560,
  height: 1920,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
    
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
    extend: {
      player: null,
      reticle: null,
      playerBullets: null,
      healthpoints: null,
      time: 0,
  }
  },
  autoFocus: false
};

//creating phaser game
const game = new Phaser.Game(config);

//PRELOAD
//preload function initialize the assets of the game (load images/tileset and sounds)
function preload() {
  this.load.image('character', 'assets/character.png');
  this.load.image('target', 'assets/target.png');
  this.load.image('tiles', 'assets/tilesheet_complete.png');
  this.load.image('bullet', 'assets/bullet.png');
  this.load.tilemapTiledJSON('map', 'assets/map.json');
}

//CREATE
//create function manage everything needed for the creation of the game
function create() {
  const self = this;
  this.physics.world.setBounds(0, 0, 2560, 1920);
  this.players = this.physics.add.group();
  this.bullets= this.physics.add.group({ classType: Bullet, runChildUpdate: true });
  var username = " ";
  const map = this.make.tilemap({key: 'map', tilewidth : 64, tileHeight: 64 }); //making physics map from map.json file
  const tileset = map.addTilesetImage('tilesheet', 'tiles');

  //WORLD'S GAME MANAGEMENENT (walls,objects etc.)

  this.wall = map.createStaticLayer('wall', tileset, 0, 0);
  this.wall.setCollisionByExclusion(-1, true); // Tiled indices can only be >= 0, therefore we are adding collision to the all walls tiles

  //adding machines layer to the map with physics
  this.machines = map.createFromObjects('machines', 'machine');
  this.machines.forEach(machine => { //editing for better collision
    machine.width = 5;
    machine.height = 60;
    machine.setOrigin(0);
    machine.x = machine.x - (machine.width/2);
    machine.y = machine.y - (machine.height/2);
    this.physics.world.enable(machine);
    machine.body.immovable = true;
  })
  
  //adding objects layer to the map with physics
  this.objects = map.createFromObjects('objects', 'object1');
  this.objects.forEach(object => {
    this.physics.world.enable(object);
    object.body.immovable = true;
  })
  //adding trees layer to the map with physics
  this.trees = map.createFromObjects('trees', 'tree');
  this.trees.forEach(tree => { //editing for better collision
    tree.width = 35;
    tree.height = 35;
    this.physics.world.enable(tree);
    tree.body.immovable = true;
  })
   //adding wall layer to the map with physics
  this.wall_objects = map.createFromObjects('wall_object', 'wall')
  this.wall_objects.forEach(wall_object => { //editing for better collision
    wall_object.width = wall_object.width + 5;
    wall_object.height = wall_object.height + 5;
    wall_object.setOrigin(0.5,0.5);
    this.physics.world.enable(wall_object);
    wall_object.body.immovable = true;
  })

  //MANAGEMENT OF SOCKET'S MESSAGES

  //on connection of a player
  io.on('connection', function (socket) {
    const sessionID = socket.id;
    socket.on('username', function(name){
      username = name;
    //spawn player in a point (x,y) without walls.
    pos_x = 0;
    pos_y = 0;
    while(self.wall.hasTileAtWorldXY(pos_x,pos_y) === true || (pos_x === 0 && pos_y === 0)){
      pos_x = Math.floor(Math.random() * 2400) + 50;
      pos_y = Math.floor(Math.random() * 1900) + 50;
    }

    // create a new player and add it to players object
    players[socket.id] = {
      name: username,
      rotation: 0,
      x: pos_x,
      y: pos_y,
      playerId: socket.id,
      input: {
        left: false,
        right: false,
        up: false,
        down: false,
        Q: false,
      },
      velocity_x: 0,
      velocity_y: 0,
      health: 0,
      hp: null,
      ammo: 5,
    };
    //console.log( players[socket.id].name  + ' connected with ID: ' + sessionID );
    // add player to server
    addPlayer(self, players[socket.id]); //defined in utilites.js
    handlePlayerCollisions(self); //defined in utilites.js
    socket.emit('current_player', players[socket.id]);

    // send the players object to the new player
    socket.emit('currentPlayers', players);  

    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function () 
    {
      //console.log(players[socket.id].name + ' disconnected');
      // remove player from server
      removePlayer(self, socket.id); //defined in utilites.js
      // remove this player from our players group
      delete players[socket.id];
      // emit a message to all players to remove this player
      io.emit('remove', socket.id);
    });
    // when a player moves, update the player data
    socket.on('playerInput', function (inputData) 
    {
      handlePlayerInput(self, socket.id, inputData); //defined in utilites.js
    });
    //same as playerinput but for the player rotation
    socket.on('rotation', function(player_rotation, player_playerId)
    { 
      handlePlayerRotation(self, player_rotation,player_playerId); //defined in utilites.js
    })
    //management of shooting
    socket.on('shot', function(reticle)
    {
      const bullet = new Bullet(self);
      shotbullet(self, bullet); //defined in utilites.js
      shotby = players[socket.id].playerId;
      //shooting
      if(players[socket.id].ammo !== 0)
      {
        bullet.fire(players[socket.id], reticle);
        players[socket.id].ammo--;
        io.emit('fire', bullet, bullet_id); 

        //handler collision between bullet and players
        self.players.getChildren().forEach((player) =>
         {
          if(socket.id !== player.playerId){ //excluding the shooter for the collision
              self.physics.add.collider(player, bullet, () => 
              {
                if (bullet.active === true && player.active === true)
                {
                    player.health = player.health - 20;
                    io.emit('hit', player.playerId);
                    // Kill ''healthbar'' and ''player'' if health <= 0
                    if (player.health == 0)
                    {
                      //console.log(players[player.playerId].name +' killed by ' + players[bullet.shotby].name) OK
                      pos_x = 0;
                      pos_y = 0;
                      while(self.wall.hasTileAtWorldXY(pos_x,pos_y) === true || (pos_x === 0 && pos_y === 0)){
                        pos_x = Math.floor(Math.random() * 2400) + 50;
                        pos_y = Math.floor(Math.random() * 1900) + 50;
                        }
                        player.health = 100;
                        player.ammo =5;
                        player.x = pos_x;
                        player.y = pos_y;
                        io.emit('death', player, player.playerId,players[player.playerId].name); //sending information about death player for scores update
                        io.emit('udpate-scores',players[socket.id].playerId, players[socket.id].name); //sending information about killer for scores update
                        //console.log(players[socket.id].name + " killed " + players[player.playerId].name ); //OK


                    }

                    // Destroy bullet
                    handleBulletCollision(bullet);
                    
                }

              });
          }
          
        });
        if(players[socket.id].ammo === 0)
        {
          io.emit('reload', shotby); //only for display the animation: while doing the animation the client stop sending messages 'shot' to the server.
          players[socket.id].ammo = 5; //5 is default ammo number values for the player.
        }
      }
    });
      
    });
    })
    
}

//UPDATE
//Update function does everything 60 frames per second 
function update() {
  this.players.getChildren().forEach((player) => { //updating players velocity 
    const input = players[player.playerId].input;
    if (input.left) {
      player.setVelocityX(-250);
      if(input.right)
      {
        player.setVelocityX(0);
      }
    } 
    else if (input.right) {
      player.setVelocityX(250);
      if(input.left)
      {
        player.setVelocityX(0);
      }
    }
    else {
      player.setVelocityX(0);
    }
    if (input.up) {
      player.setVelocityY(-250);
      if(input.down)
      {
        player.setVelocityY(0);
      }
    } else if(input.down){
      player.setVelocityY(250);
      if(input.up)
      {
        player.setVelocityY(0);
      }
    }
    else {
      player.setVelocityY(0);
    }
    constrainVelocity(players[player.playerId], 250); //defined in utilites.js

    //set the positions and send to the client
    players[player.playerId].x = player.x;
    players[player.playerId].y = player.y;
    players[player.playerId].velocity_x = player.body.velocity.x;
    players[player.playerId].velocity_y = player.body.velocity.y;
  });
  
  io.emit('playerUpdates', players);
}
window.gameLoaded();