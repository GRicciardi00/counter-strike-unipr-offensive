
const passport = require('passport');
const express = require('express');
const jwt = require('jsonwebtoken');
const tokenList = {};
const router = express.Router();


router.get('/status', (req, res, next) => {
  res.status(200).json({ status: 'ok' });
});

//call passport singup defined in /auth.js
router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res, next) => {
  res.status(200).json({ message: 'signup successful' });
});

//call passport login defined in /auth.js
router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error('An Error occured');
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = {
          _id: user._id,
          username: user.username
        };
        const token = jwt.sign({ user: body }, 'top_secret', { expiresIn: 300 }); //use jsonwebtoken to create a token
        const refreshToken = jwt.sign({ user: body }, 'top_secret_refresh', { expiresIn: 86400 });
        // store tokens in cookie
        res.cookie('jwt', token);
        res.cookie('refreshJwt', refreshToken);
        // store tokens in memory
        tokenList[refreshToken] = {
          token,
          refreshToken,
          username: user.username,
          _id: user._id
        };
        //Send back the token to the user
        return res.status(200).json({ token, refreshToken });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

//manage token route
router.post('/token', (req, res) => {
  /*pull the username and refreshToken from the request body, then check to see if the refreshToken is in the tokenList object we are using for tracking the user’s tokens,
  we made sure the username matches the one stored in memory. If these do not match, or if the token is not in memory, then we respond with a 401 status code.
If they do match, then we create a new token and store it in memory and update the response cookie with the new token and 200 response code. */
  const { refreshToken } = req.body;
  if (refreshToken in tokenList) {
    const body = { username: tokenList[refreshToken].username, _id: tokenList[refreshToken]._id };
    const token = jwt.sign({ user: body }, 'top_secret', { expiresIn: 300 });

    // update jwt
    res.cookie('jwt', token);
    tokenList[refreshToken].token = token;

    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

//manage logout route
router.post('/logout', (req, res) => {
  if (req.cookies) {
    const refreshToken = req.cookies['refreshJwt'];
    if (refreshToken in tokenList) delete tokenList[refreshToken]
    res.clearCookie('refreshJwt');
    res.clearCookie('jwt');
  }
  res.status(200).json({ message: 'logged out' });
});
module.exports = router;