const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Admin = require('../models/Admin');
const sendOtpEmail = require('../utils/emailService');
const generateToken = require('../utils/generateToken');

const signupUser = asyncHandler(async (req, res) => {
  const { name, enrollmentNo, email, password } = req.body;

  if (!email || !email.endsWith('.rishihood.edu.in')) {
    res.status(400);
    throw new Error('Please use a valid official email ID ending with .rishihood.edu.in');
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { enrollmentNo }]
  });

  if (existingUser && existingUser.isVerified) {
    res.status(400);
    throw new Error('User already exists and is verified');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  let user;
  if (existingUser) {
    existingUser.name = name;
    existingUser.password = password;
    existingUser.otp = otp;
    existingUser.otpExpires = otpExpires;
    existingUser.enrollmentNo = enrollmentNo;
    user = await existingUser.save();
  } else {
    user = await User.create({
      name,
      enrollmentNo,
      email,
      password,
      otp,
      otpExpires,
    });
  }

  if (user) {
    try {
      await sendOtpEmail(email, otp);
      res.status(201).json({
        message: 'OTP sent to your email. Please verify to complete signup.',
        email: user.email
      });
    } catch (error) {
      res.status(500);
      throw new Error('Email delivery failed');
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (user && user.otp === otp && user.otpExpires > Date.now()) {
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      enrollmentNo: user.enrollmentNo,
      role: 'user',
      token: generateToken(user._id, 'user'),
    });
  } else {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      try {
        await sendOtpEmail(email, otp);
        return res.status(403).json({
          message: 'Please verify your email. OTP sent.',
          email: user.email,
          requiresVerification: true
        });
      } catch (error) {
        res.status(500);
        throw new Error('Email delivery failed');
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      enrollmentNo: user.enrollmentNo,
      role: 'user',
      token: generateToken(user._id, 'user'),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && admin.password === password) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      token: generateToken(admin._id, 'admin'),
    });
  } else {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }
});

module.exports = {
  signupUser,
  verifySignupOtp,
  loginUser,
  loginAdmin,
};
