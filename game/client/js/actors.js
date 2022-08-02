//Health HUD of the player
class HealthBar {
    constructor (scene, x, y)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = -28 + x;
        this.y = -40 + y;
        this.value = 100;
        this.p = 76 / 100;



        scene.add.existing(this.bar);
    }
    decrease (amount)
    {
        this.value -= amount;

        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }
    draw ()
    {
        this.bar.clear();
        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 80*0.7, 16*0.7);
        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 76*0.7, 12*0.7);
        if (this.value < 40)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }
        var d = Math.floor(this.p * this.value);
        this.bar.fillRect(this.x + 2, this.y + 2, d*0.7, 12*0.7);
    }
    move(new_x,new_y)
      {
        this.bar.x = new_x;
        this.bar.y = new_y;
      }
}
