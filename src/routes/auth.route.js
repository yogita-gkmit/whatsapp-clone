const express = require('express');
const router = express.Router();
const { uploads } = require('../middlewares/multer.middleware');

const {
	// register,
	sendOTP,
	// verifyOTP,
} = require('../controllers/auth.controller');

router.post('/send-otp', sendOTP);
// router.post('/verify-otp', verifyOTP);
// router.post('/register', register, uploads.single('picture'));

module.exports = router;
