const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validators.middleware');
const {
	registerSchema,
	sendOTPSchema,
	verifyOTPSchema,
} = require('../validators/auth.validator');

const {
	register,
	sendOTP,
	verifyOTP,
	logout,
} = require('../controllers/auth.controller');

router.post('/sendOtp', validate(sendOTPSchema), sendOTP);
router.post('/verifyOtp', validate(verifyOTPSchema), verifyOTP);
router.post(
	'/register',
	upload.single('image'),
	validate(registerSchema),
	register,
);
router.post('/logout', authMiddleware, logout);
module.exports = router;
