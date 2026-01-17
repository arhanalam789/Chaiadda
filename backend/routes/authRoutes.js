const express = require('express');
const router = express.Router();
const { signupUser, verifySignupOtp, loginUser, loginAdmin } = require('../controllers/authController');

router.post('/signup', signupUser);
router.post('/verify-signup', verifySignupOtp);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);

module.exports = router;
