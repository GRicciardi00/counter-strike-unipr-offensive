const mongoose = require('mongoose')
const bcrypt = require('bcrypt'); //bcrypt is a helper library for hashing passwords.
const Schema = mongoose.Schema; //mongoose Schema object allows to define the fields we want our model to have. By creating and using a Schema object, it will provide built-in typecasting and validation.
const UserSchema = new Schema({

    username : {
        type: String,
        required: true,
        unique : true
    },
    password : {
        type : String,
        required : true
  },
    kills : {
        type: Number,
        default: 0
  },
    deaths : {
        type: Number,
        default: 0
    }  
});
UserSchema.pre('save', async function (next) { //pre-save hook that will be called before a document is saved in MongoDB.
  const user = this;    //get a reference to the current document that is about to be saved 
  const hash = await bcrypt.hash(this.password, 10); //use bcrypt to hash the password.
  this.password = hash;
  next(); //call the callback function that passed as an argument to our hook.
});
UserSchema.methods.isValidPassword = async function (password) { //used for validating that the user’s password is correct when they try to log in.
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
}
const UserModel = mongoose.model('user', UserSchema); //create our model by calling mongoose.model, two arguments: the name of our model and the schema that will be used for the model.
module.exports = UserModel;





