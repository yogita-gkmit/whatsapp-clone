const User = require('../models').User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { reddis } = require('../config/redis');
const { transporter, mailOptions } = require('../utils/email.util');
const { validUser } = require('../helpers/auth.helper');
const { addTokenToBlacklist } = require('../helpers/redis.helper');

const dotenv = require('dotenv');
dotenv.config();

const redis = require('redis');
const client = redis.createClient();

async function generateOtp() {
	let otp = otpGenerator.generate(6, {
		upperCaseAlphabets: false,
		lowerCaseAlphabets: false,
		specialChars: false,
	});

	return otp;
}
async function sendOtp(email) {
	if (!(await validUser(email))) {
		throw new Error('User is not registered');
	}
	const otp = await generateOtp();
	await reddis.set(email, otp);

	const mailOptions = {
		from: process.env.MAIL_USER,
		to: email,
		subject: 'OTP for Registration',
		text: `Your OTP is ${otp}. It expires in 5 minutes.`,
	};
	await transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			throw new Error('Error sending mail');
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	return { message: 'otp sent successfully', otp };
}

async function verifyOtp(email, otp) {
	if (!(await validUser(email))) {
		return { message: 'User is not registered' };
	}
	const user = await User.findOne({ where: { email: email } });

	const storedOTP = await reddis.get(email);

	if (!(storedOTP == otp)) {
		return { message: 'OTP did not matched' };
	}
	reddis.del(email);
	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	});
	return token;
}

async function create(name, image, about, email) {
	if (await validUser(email)) {
		throw new Error('User already registered');
	}
	await User.create({
		name,
		image,
		email,
		about,
	});
}

async function remove(token) {
	if (!token) {
		throw new Error('Token is required for logout');
	}
	try {
		const decodedToken = jwt.decode(token);
		if (!decodedToken) {
			throw new Error('Invalid token');
		}
		const expiresIn = 3600;
		await addTokenToBlacklist(token, expiresIn);

		return { message: 'Logged out successfully' };
	} catch (error) {
		console.log(error);
		throw new Error('Logout failed');
	}
}

module.exports = { create, sendOtp, verifyOtp, remove };
