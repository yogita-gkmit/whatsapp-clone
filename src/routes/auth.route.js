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
	sendOtp,
	verifyOtp,
	logout,
} = require('../controllers/auth.controller');

router.post('/sendOtp', validate(sendOTPSchema), sendOtp);
router.post('/verifyOtp', validate(verifyOTPSchema), verifyOtp);
router.post(
	'/register',
	upload.single('image'),
	validate(registerSchema),
	register,
);
router.post('/logout', authMiddleware, logout);
module.exports = router;
