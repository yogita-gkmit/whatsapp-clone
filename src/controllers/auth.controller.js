const jwt = require('jsonwebtoken');
const User = require('../models').User;
const { sendOtp, verifyOtp, create } = require('../services/auth.service');
const { validUser } = require('../helpers/auth.helper');

async function register(req, res) {
	try {
		const { name, about, email } = req.body;
		const image = req.file?.path;
		console.log(image, email, about, name);
		await create(name, image, about, email);
		res.status(200).json({ message: `User has been successfully created` });
	} catch (error) {
		console.log('Error registering the user', error);
		res.status(400).json({ message: error.message });
	}
}

async function sendOTP(req, res) {
	try {
		const { email } = req.body;

		const response = await sendOtp(email);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (err) {
		console.log(err);
		res.status(400).json({ message: err.message });
	}
}

async function verifyOTP(req, res) {
	try {
		const { email, otp } = req.body;
		const token = await verifyOtp(email, otp);

		res.status(200).json({ message: 'User verified successfully', token });
	} catch (error) {
		console.log('Error occurred while sending email: ', error);
		throw error;
	}
}

module.exports = { register, sendOTP, verifyOTP };
