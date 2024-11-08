const jwt = require('jsonwebtoken');
const User = require('../models').User;
const { create, sendToMail } = require('../services/auth.service');
const { validUser } = require('../helpers/auth.helper');

async function sendOTP(req, res) {
	try {
		const { email } = req.body;

		if (await validUser(email)) {
			return res.status(401).json({ message: 'User is already registered' });
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

async function verifyOTP(req, res) {}

async function register(req, res) {}

module.exports = { register, sendOTP, verifyOTP };
