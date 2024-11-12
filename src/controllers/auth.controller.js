const jwt = require('jsonwebtoken');
const User = require('../models').User;
const {
	sendOtp,
	verifyOtp,
	create,
	remove,
} = require('../services/auth.service');
const { validUser } = require('../helpers/auth.helper');

async function register(req, res) {
	try {
		const { name, about, email } = req.body;
		const image = req.file?.path;
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
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
}

async function verifyOTP(req, res) {
	try {
		const { email, otp } = req.body;
		const token = await verifyOtp(email, otp);

		res.status(200).json({ message: 'User verified successfully', token });
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
}

async function logout(req, res) {
	try {
		const token = req.headers['authorization'];
		const result = await remove(token);
		res.status(200).json({
			message: result.message || 'Successfully logged out',
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
}

module.exports = { register, sendOTP, verifyOTP, logout };
