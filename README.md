# counter-strike-unipr-offensive
The idea comes from the passion of both of us for the well-known game Counter Strike Global Offensive and the full sharing of the thought by the French poet Anatole France: 
> ''you only learn by having fun''
>   
The game is written with Javascript, Node, HTML, CSS. <br/>
You can try the game here ! -> https://un1proffensiv3.herokuapp.com/ <br/>
![gameplay](https://user-images.githubusercontent.com/102236495/182364123-50ed0b0e-41fb-46e1-aae0-e68e4295e96e.png)
![screenshot classifica](https://user-images.githubusercontent.com/102236495/182363393-1790b44e-53cd-4fcd-9223-85266de2d217.png)

## Game Architecture 
The game use a client-authoritative server architecture, the communication occurs by socket with `socket.io` library, the client manages the player's inputs and sends them to the server which uses to manage the game logic. The game logic is made with `Phaser` library, the users and scores are stored into a `MongoDB` Database. <br/>
![architecture](https://user-images.githubusercontent.com/102236495/182364896-041c9839-efeb-485e-ab5f-61d4eb532dfb.png)
<br/> (Image from https://thomasfuller.codes/pew-pew-pew-io-game/) 
## Libraries and framework
- "bcrypt": "^5.0.1",
- "body-parser": "^1.20.0",
- "canvas": "^2.9.3",
- "cookie-parser": "^1.4.6",
- "datauri": "^4.1.0",
- "dotenv": "^16.0.1",
- "express": "^4.18.1",
- "jdom": "^3.2.5",
- "jsdom": "^20.0.0",
- "jsonwebtoken": "^8.5.1",
- "mongoose": "^6.5.0",
- "passport": "^0.6.0",
- "passport-jwt": "^4.0.0",
- "passport-local": "^1.0.0",
- "phaser": "^3.55.2",
- "socket.io": "^4.5.1"

## How to run the code locally
You will need `node` and `mongoDB` installed on your computer:
1. Download the directory.
2. Open the direcory with the `shell`.
3. Run `npm install`. 
4. Run `node app.js` from ''game'' directory.
5. Open `http://localhost:8081` from your browser.
6. Enjoy :smile:
## Credits
Game made by Giuseppe Ricciardi and Helmi Zammali, computer engineer students from University of Parma. <br/>
Thanks to Kenney for the copyright-free sprites.
