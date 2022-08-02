//setting configurations for client-side phaser game
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1000,
    height: 750,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
       }
    },
    scene: [{create}, MainMenuScene, GameScene, Highscore ]


  };

//creating phaser game
var game = new Phaser.Game(config);

function create(){
    this.scene.start('menu');
}