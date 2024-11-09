const jwt = require('jsonwebtoken');
const User = require('../models').User;
const { sendToMail, verify } = require('../services/auth.service');
const { validUser } = require('../helpers/auth.helper');

async function register(req, res) {}

async function sendOTP(req, res) {
	try {
		const { email } = req.body;

		if (!(await validUser(email))) {
			return res.status(401).json({ message: 'User is not registered' });
		}
		const response = await sendToMail(email);
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
		const token = await verify(email, otp);

		res.status(200).json({ message: 'User verified successfully', token });
	} catch (error) {
		console.log('Error occurred while sending email: ', error);
		throw error;
	}
}

module.exports = { register, sendOTP, verifyOTP };
