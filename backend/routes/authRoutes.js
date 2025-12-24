const express = require('express');
const router = express.Router();
const { loginUser, verifyOtp, loginAdmin } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/verify', verifyOtp);
router.post('/admin/login', loginAdmin);

module.exports = router;
