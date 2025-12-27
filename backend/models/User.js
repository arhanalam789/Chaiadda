const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    default: 'User'
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  role: {
    type: String,
    default: 'user'
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
