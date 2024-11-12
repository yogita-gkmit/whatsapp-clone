const jwt = require('jsonwebtoken');
const User = require('../models').User;

const authServices = require('../services/auth.service');
const { validUser } = require('../helpers/auth.helper');

async function register(req, res) {
	try {
		const payload = req.body;
		const image = req.file?.path;
		await authServices.create(payload, image);
		res.status(200).json({ message: `User has been successfully created` });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function sendOTP(req, res) {
	try {
		const payload = req.body;

		const response = await authServices.sendOtp(payload);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function verifyOTP(req, res) {
	try {
		const payload = req.body;
		const token = await authServices.verifyOtp(payload);

		res.status(200).json({ message: 'User verified successfully', token });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function logout(req, res) {
	try {
		const token = req.headers['authorization'];
		const result = await authServices.remove(token);
		res.status(200).json({
			message: result.message || 'Successfully logged out',
		});
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

module.exports = { register, sendOTP, verifyOTP, logout };
