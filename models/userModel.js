const mongoose = require('mongoose');

const validator = require('validator');
const bcrypt = require('bcrypt');

// name, email, phoneNumber, photo, password, passwordconfirmation

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
    maxlength: [60, 'A user must have at least 60 characters'],
    minlength: [3, 'A user must have at least3 characters'],
    validate: {
      validator: (val) => validator.isAlpha(val, ['en-US'], { ignore: ' ' }),
      message: 'A name must only  contain characters',
    },
    // validate: [validator.isAlpha({ allow_spaces: true }), 'invalid name'],
  },
  slug: String,
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'invalid email address'],
    unique: true,
  },
  imageUser: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'user must have a password'],
    minlength: 8,
    maxlength: 32,
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'confirm your password'],
    validate: {
      //this only works for creat and save in the first time only when creating a user
      validator: function (value) {
        return value === this.password;
      },
      message: 'password do not match',
    },
  },
});
userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // hash this password with coast of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete the passwordconfirmation field
  this.passwordConfirmation = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
