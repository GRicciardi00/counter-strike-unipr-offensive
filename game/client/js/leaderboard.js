let scores;
  class Highscore extends Phaser.Scene {
    constructor() {
      super({
        key: 'Highscore'
      });
      this.scores = [];

    }
    init()
    {

    }
    preload() {
      this.load.bitmapFont('arcade', 'assets/arcade.png', 'assets/arcade.xml');
      this.load.image('csuomenu', 'assets/csuomenu.png');
      
    }
    create() {
      var self = this;
      const background_leaderboard = this.add.image(0,0, 'csuomenu').setOrigin(0,0).setDisplaySize(1000,750);  
      this.cursors = this.input.keyboard.createCursorKeys();
      $.ajax({ //getting scores from database
        type: 'GET',
        url: '/scores',
        success: function(data) { //if success print scores
            scores = data;
            self.add.bitmapText(330, 20, 'arcade', 'LEADERBOARD').setTint(0xffffff);
            self.add.bitmapText(50, 110, 'arcade', 'RANK  KILLS  DEATHS   NAME').setTint(0xffffff);
            for (let i = 1; i < 6; i++) { //printing scores from database
            if (scores[i-1]) {
                self.add.bitmapText(50, 160 + 50 * i, 'arcade', ` ${i}      ${scores[i-1].kills}       ${scores[i-1].deaths}     ${scores[i-1].username}`).setTint(0xffffff);
            } else {
                self.add.bitmapText(50, 160 + 50 * i, 'arcade', ` ${i}      0       0      ---`).setTint(0xffffff);
            }
      }
      self.add.bitmapText(100, 500, 'arcade', 'PRESS SPACEBAR TO GO BACK')
        },
        error: function(xhr) {
          console.log(xhr);
        }
    });
      
    }
    update(){
        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
		if (spaceJustPressed)
		{
            this.scene.stop()
            this.scene.start("menu")
            
        }

    }
}

      

