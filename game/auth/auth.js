const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const UserModel = require('../models/userModel');

// handle user registration
passport.use('signup', new localStrategy({ 
  /* localStrategy takes two arguments: an options object and a callback function.
For the options object, we set the usernameField and passwordField field. we set the passReqToCallback field to true to pass the request object to the callback function. */
usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true 
}, async (req, username, password, done) => {  
  /* In the callback function there is the logic for the singup route.Lastly, we called the done function that was passed as an argument to the callback function. */
  try {
    const { username } = req.body;
    const user = await UserModel.create({username,password});
    return done(null, user);
  } catch (error) {
    done(error);
  }
}));

// handle user login
passport.use('login', new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, async (username, password, done) => {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      const validate = await user.isValidPassword(password);
      if (!validate) {
        return done(null, false, { message: 'Wrong Password' });
      }
      return done(null, user, { message: 'Logged in Successfully' });
    } catch (error) {
      return done(error);
    }
  }));
  
  // verify token is valid
  passport.use(new JWTstrategy({
    secretOrKey: 'top_secret',  //secretOrKey is used for signing the JWT that is created.
    jwtFromRequest: function (req) { //jwtFromRequest is a function that is used for getting the jwt from the request object (cookies)
      let token = null;
      if (req && req.cookies) token = req.cookies['jwt'];
      return token;
    }
  }, async (token, done) => {
    try {
      return done(null, token.user);
    } catch (error) {
      done(error);
    }
  }));