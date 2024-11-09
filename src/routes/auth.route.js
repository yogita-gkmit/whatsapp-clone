const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer.middleware');

const {
	register,
	sendOTP,
	verifyOTP,
} = require('../controllers/auth.controller');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', upload.single('image'), register);

module.exports = router;
