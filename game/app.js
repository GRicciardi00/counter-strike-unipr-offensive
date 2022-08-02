//include dotenv for MongoDB connection.
require('dotenv').config();

const path = require('path');
//included jsdom package, which will to use the DOM API on the server.
const jsdom = require('jsdom');
 // Referenced the express module,will render static files.
const express = require('express');

const bodyParser = require('body-parser');

const routes = require('./routes/main');

const secureRoutes = require('./routes/secure');

const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');

const passport = require('passport');

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
mongoose.connect(uri, { useNewUrlParser : true});
mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
mongoose.connection.on('connected', function () {
  console.log('connected to mongo');
});

//create express server
const app = express();
// Supplied the app to the HTTP server, allow express to handle the HTTP requests.
const server = require('http').Server(app);

//update express settings for login and singup validation
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser());

// require passport auth
require('./auth/auth');

app.get('/game.html', passport.authenticate('jwt', { session : false }), function (req, res) {
  res.sendFile(__dirname + '/client/game.html');
});

 // Updated the server to render our static files using express.static function.
app.use(express.static(__dirname + '/client'));

 // Told the server to serve the index.html file as the root page.
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// main routes
app.use('/', routes);
app.use('/', passport.authenticate('jwt', { session : false }), secureRoutes);

// catch all other routes
app.use((req, res, next) => {
  res.status(404).json({ message: '404 - Not Found' });
});

const io = require('socket.io')(server);
const { JSDOM } = jsdom;
const DatauriParser = require('datauri/parser');
const datauri = new DatauriParser();


function setupAuthoritativePhaser() {
    //JSDOM’s fromFile method to load the index.html of authoritative server. 
    JSDOM.fromFile(path.join(__dirname, 'authoritative_server/index.html'), {
      // To run the scripts in the html file
      runScripts: "dangerously",
      // Also load supported external resources
      resources: "usable",
      // So requestAnimatinFrame events fire
      pretendToBeVisual: true
       // Since the fromFile method returns a promise, .then() wait for the promise to resolve, then invoke a callback function.
    }).then((dom) => {  //added the logic for starting server.
      dom.window.gameLoaded = () => {
        dom.window.URL.createObjectURL = (blob) => { //use the datauri.format method to format the blob into the format needed for JSDOM.
            if (blob){
              return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
          };
          dom.window.URL.revokeObjectURL = (objectURL) => {}; //do nothing
        // Had the server start listening on port 8081.  
          let port = process.env.PORT;
          if (port == null || port == "") {
            port = 8081;
          }
          server.listen(port, function () {
            console.log(`Listening on ${server.address().port}`);
          });
        dom.window.io = io;
      };
      
    }).catch((error) => {
      console.log(error.message);
    });
  }
  setupAuthoritativePhaser();



    
   
    
   
   
    
    
    
    
  
