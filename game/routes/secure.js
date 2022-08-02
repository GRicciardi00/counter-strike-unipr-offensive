const express = require('express');
const asyncMiddleware = require('../middleware/asyncMiddleware');
const UserModel = require('../models/userModel');

const router = express.Router();


router.post('/submit-scores', asyncMiddleware(async (req, res, next) => { //take the username and scores values from the request body.
  const { username, } = req.body;
  await UserModel.updateOne({ username }, {$inc: {kills: 1}}); //increase by one kills in the database where the provided username matches the username property on the record.
  res.status(200).json({ status: 'ok' });
}));

router.post('/submit-deaths', asyncMiddleware(async (req, res, next) => { //take the username and deaths values from the request body.
  const { username } = req.body;
  await UserModel.updateOne({ username }, {$inc: {deaths: 1}}); //increase by one deaths in the database where the provided username matches the username property on the record.
  res.status(200).json({ status: 'ok' });
}));



router.get('/scores', asyncMiddleware(async (req, res, next) => { // find method on the UserModel to search for documents in the database.
  const users = await UserModel.find({}, 'username kills deaths -_id').sort({ kills: -1}).limit(10); //The second argument is a string that allows to control which fields have to be returned.  //We then called the sort method to sort the results that are returned. ''sort' method allows to specify the field to sort by, and by setting that value to -1 the results will be sorted in descending order.
  res.status(200).json(users);
}));
module.exports = router;




