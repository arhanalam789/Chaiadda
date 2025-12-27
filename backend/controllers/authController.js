const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Admin = require('../models/Admin');
const sendOtpEmail = require('../utils/emailService');
const generateToken = require('../utils/generateToken');

// @desc    User Login (Request OTP)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.endsWith('rishihood.edu.in')) {
    res.status(400);
    throw new Error('Please use a valid college email ending with rishihood.edu.in');
  }

  // Extract name from email (part before @)
  const nameFromEmail = email.split('@')[0]
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Upsert user
  const user = await User.findOneAndUpdate(
    { email },
    { 
      email, 
      name: nameFromEmail, // Automatically set/update name from email
      otp, 
      otpExpires
    },
    { new: true, upsert: true }
  );

  // Send real email
  try {
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Email Send Error:', error);
    res.status(500);
    throw new Error('Email delivery failed. Please check backend logs.');
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (user && user.otp === otp && user.otpExpires > Date.now()) {
    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      email: user.email,
      role: 'user',
      token: generateToken(user._id, 'user'),
    });
  } else {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }
});

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check in Admin collection
  const admin = await Admin.findOne({ email });

  // Simple password check (plaintext for now)
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
  loginUser,
  verifyOtp,
  loginAdmin,
};
