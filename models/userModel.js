const crypto = require('crypto');
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
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'user must have a password'],
    minlength: 8,
    maxlength: 32,
    select: false,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  //this point to the current query
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
