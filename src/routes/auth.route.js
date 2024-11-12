const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

const {
	register,
	sendOTP,
	verifyOTP,
	logout,
} = require('../controllers/auth.controller');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', upload.single('image'), register);
router.post('/logout', authMiddleware, logout);
module.exports = router;
