//Bullet
var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,
  
    initialize:
  
    // Bullet Constructor
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.shotby = 0;  //shooter
        this.id = 'id' + (new Date()).getTime();
        this.valid = false;
        this.setSize(12, 12, true);
    },
  
    // Fires a bullet from the player to the reticle
    fire: function (shooter, target)
    {
        this.shotby = shooter.playerId;
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));
  
        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }
  
        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },
  
    // Updates the position of the bullet each cycle
    update: function (time, delta) // Delta component provides access to delta values between the Game Objects current and previous position.
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
        if(this.valid === true)
        io.emit('bulletUpdate', this, this.id,this.shotby,); //send message to the client
    }
  
  });