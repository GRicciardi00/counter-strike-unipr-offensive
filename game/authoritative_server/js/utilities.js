// Ensures sprite speed doesnt exceed maxVelocity while update is called (from Phaser example)
function constrainVelocity(sprite, maxVelocity)
{
    if (!sprite || !sprite.body)
      return;

    var angle, currVelocitySqr, vx, vy;
    vx = sprite.body.velocity.x;
    vy = sprite.body.velocity.y;
    currVelocitySqr = vx * vx + vy * vy;

    if (currVelocitySqr > maxVelocity * maxVelocity)
    {
        angle = Math.atan2(vy, vx);
        vx = Math.cos(angle) * maxVelocity;
        vy = Math.sin(angle) * maxVelocity;
        sprite.body.velocity.x = vx;
        sprite.body.velocity.y = vy;
    }
}

//handling players inputs from socket
function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
      if (playerId === player.playerId) {
        players[player.playerId].input = input;
      }
    });
  
  }

  //handling players inputs from socket
  function handlePlayerRotation(self,rotation,playerId){
    self.players.getChildren().forEach((player) => {
      if (playerId === player.playerId) {
        players[player.playerId].rotation = rotation;
      }
    });
  
  }
  
  //add playert to the server
  function addPlayer(self, playerInfo) {
    const player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'character').setOrigin(0.5, 0.5).setDisplaySize(40, 40);
    player.health = 100;
    player.ammo = 5;
    player.playerId = playerInfo.playerId;
    
    self.players.add(player);
    
  }

  //remove player from the server
  function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
  }
  
 //add collision between player and worldworld:  
  function handlePlayerCollisions(self){
    self.players.getChildren().forEach((player) => {
      player.setCollideWorldBounds(true);
      player.onWorldBounds = true;
      self.physics.add.collider(player, self.wall);
      self.physics.add.collider(player, self.objects);
      self.physics.add.collider(player, self.machines);
      self.physics.add.collider(player, self.trees);
      self.physics.add.collider(player, self.players);
    });
  
    
  }


  //function called when the bullet collide with something in the game
  function handleBulletCollision(bullet){
      bullet.setActive(false);
      bullet.setVisible(false);
      io.emit('destroyBullet', bullet.id, bullet.shotby);
  }

  //physics management of the bullet
  function shotbullet(self,bullet)
  {
    if (typeof bullet.id !== "undefined")
    {
      bullet.setActive(true).setVisible(true);
      if(bullet){
        bullet.valid = true;
        self.bullets.add(bullet);
        bullet_id = bullet.id;
        //adding collision with world bounds
        bullet.body.collideWorldBounds=true;
        // Turning this on will allow to listen to the 'worldbounds' event
        bullet.body.onWorldBounds = true;
        bullet.body.world.on('worldbounds', function(body) {
        // Check if the body's game object is the sprite of bullet
        if (body.gameObject === this) {
        // Stop physics and render updates for this object
            this.setActive(false);
            this.setVisible(false);
            io.emit('destroyBullet', bullet.id);
      }
      }, bullet);

        //collisions between bullet and map layers
        self.physics.add.collider(self.objects,bullet,() => {
          if(bullet.active)
          {
            handleBulletCollision(bullet);
          }
        })
        self.physics.add.collider(self.wall_objects,bullet,() => {
          if(bullet.active)
          {
            handleBulletCollision(bullet);
          }
        })
        self.physics.add.collider(self.machines,bullet,() => {
          if(bullet.active)
          {
            handleBulletCollision(bullet);
        }
      })
        self.physics.add.collider(self.trees,bullet,() => {
          if(bullet.active)
          {
            handleBulletCollision(bullet);
          }
      })
        
        
      }

    }
  }