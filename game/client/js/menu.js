class MainMenuScene extends Phaser.Scene
{
    
	constructor()
	{
		super({key : 'menu'});
	}

	init()
	{
		this.cursors = this.input.keyboard.createCursorKeys();
	}

	preload()
    {
        this.load.image('menu', 'assets/menupic.png');
		this.load.image('play', 'assets/PlayButton.png');
        this.load.image('controls', 'assets/ControlsButton.png');
		this.load.image('options', 'assets/OptionsButton.png');
        this.load.image('cursor-hand', 'assets/cursor_hand.png');
        this.load.audio('menusn', ['assets/ghoneya.mp3']);
    }

    create()
    {
        self = this;
        const background = this.add.image(-100,-50, 'menu').setOrigin(0,0).setDisplaySize(1200,800);
        this.cursors = this.input.keyboard.createCursorKeys(); 
        this.buttons = Phaser.GameObjects.Image[null] = [];
        this.selectedButtonIndex = 0;
        this.buttonSelector = Phaser.GameObjects.Image;
		const width = 1000;
        const height  = 750;
        this.menusn = this.sound.add('menusn');
        this.menusn.play();

        // Play button
        this.playButton = this.add.image(width / 10, height * 0.7, 'play').setDisplaySize(150, 50);

        // controls button
        this.controlsButton = this.add.image(this.playButton.x, this.playButton.y + this.playButton.displayHeight + 10, 'controls').setDisplaySize(150, 50);

        // Options button
        this.optionsButton = this.add.image(this.controlsButton.x, this.controlsButton.y + this.controlsButton.displayHeight + 10, 'options').setDisplaySize(150, 50);

        this.buttons.push(this.playButton);
        this.buttons.push(this.controlsButton);
        this.buttons.push(this.optionsButton);
        this.buttonSelector = this.add.image(0,0,'cursor-hand');
        this.selectButton(0);
        
        this.events.on('shutdown', () =>{
            this.playButton.off('selected');
            this.controlsButton.off('selected');
            this.optionsButton.off('selected');
        })
        }

	selectButton(index = Number)
	{
		const currentButton = this.buttons[this.selectedButtonIndex];

        // set the current selected button to a white tint
        currentButton.setTint(0xffffff);

        const button = this.buttons[index];

        // set the newly selected button to a green tint
        button.setTint(0x66ff7f);

        // move the hand cursor to the right edge
        this.buttonSelector.x = button.x + button.displayWidth * 0.5;
        this.buttonSelector.y = button.y + 10;

        // store the new selected index
        this.selectedButtonIndex = index;
	}
    
    //the method is used to select the next button when up or down keys are pressed
	selectNextButton(change = 1)
	{
		let index = this.selectedButtonIndex + change;

        // wrap the index to the front or end of array
        if (index >= this.buttons.length)
        {
            index = 0;
        }
        else if (index < 0)
        {
            index = this.buttons.length - 1;
        }

        this.selectButton(index);
	}

	confirmSelection()
	{
		// get the currently selected button
	    const button = this.buttons[this.selectedButtonIndex];

	    // emit the 'selected' event
	    button.emit('selected');
	}
	
	update()
	{
		const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up);
		const downJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down);
		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
		if (upJustPressed)
		{
			this.selectNextButton(-1);
		}
		else if (downJustPressed)
		{
			this.selectNextButton(1);
		}
		else if (spaceJustPressed)
		{
			this.confirmSelection()            
            if (this.buttons[this.selectedButtonIndex] == this.playButton)
            {
                this.menusn.stop()
                this.scene.start('game')    //the gameScene, a handler so when the play button is pressed we will transit to the new scene
            } 
            else if (this.buttons[this.selectedButtonIndex] == this.controlsButton)
            {
                this.menusn.stop()
                window.alert(" TO SHOOT THE BULLET LEFTCLICK YOUR MOUSE\n TO MOVE USE WASD :\n W TO GO FORWARD\n S TO GO BACKWARD\n A TO GO LEFT\n D TO GO RIGHT \n Q TO REMOVE FOCUS MODE \n ESC TO GO BACK TO MENU");//handler per il bottone del settings
            }
            else if (this.buttons[this.selectedButtonIndex] == this.optionsButton)
            {
                this.menusn.stop()
                this.scene.start("Highscore")   //Handler for leaderboard
            }

	    }
    }
}


