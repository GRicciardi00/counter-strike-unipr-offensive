
// for displaying usernames
var style = { font: "18px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" }; 

//function called in game.js for display all the players on the screen
function displayPlayers(self, playerInfo, sprite) {
    const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5,0.5).setDisplaySize(40, 40);
    player.hp =  new HealthBar(self, 0, 0);  //Healthbar definition in actors.js
    player.name = playerInfo.name;
    player.userHUD = self.add.text(0,0,player.name,style); //displaying the name text
    player.userHUD.setTint(0xff0000) //red as default tint for enemies
    player.playerId = playerInfo.playerId;
    self.players.add(player);
  }

//does the same thing of displayPlayers for the bullets
  function displayBullet(self, bulletInfo, sprite) {
    const bullet = self.add.sprite(bulletInfo.x+30, bulletInfo.y-25, sprite).setOrigin(0.3,0.3).setDisplaySize(20, 20);  //+10 and -20 for drawing bullet from pistol and not from the center of pg
    bullet.id = bulletInfo.id;
    bullet.shotby = bulletInfo.shotby;
    self.bullets.add(bullet);
  }

//limits the movement of the pointer around a circle with origin in the player's position when the screen is locked
  function constrainReticle(reticle, radius)
  {
    var distX = reticle.x-current_player.x; // X distance between player & reticle
    var distY = reticle.y-current_player.y; // Y distance between player & reticle
  
    // Ensures reticle cannot be moved offscreen
    if (distX > 1000)
        reticle.x = current_player.x+1000;
    else if (distX < -1000)
        reticle.x = current_player.x-1000;
  
    if (distY > 750)
        reticle.y = current_player.y+750;
    else if (distY < -750)
        reticle.y = current_player.y-750;
  
    // Ensures reticle cannot be moved further than dist(radius) from player
    var distBetween = Phaser.Math.Distance.Between(current_player.x, current_player.y, reticle.x, reticle.y);
    if (distBetween > radius)
    {
        // Place reticle on perimeter of circle on line intersecting player & reticle
        var scale = distBetween/radius;
  
        reticle.x = current_player.x + (reticle.x-current_player.x)/scale;
        reticle.y = current_player.y + (reticle.y-current_player.y)/scale;
    }
  }