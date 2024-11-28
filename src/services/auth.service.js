const User = require('../models').User;
const jwt = require('jsonwebtoken');
const { reddis } = require('../config/redis');
const { sequelize } = require('../models');
const mail = require('../helpers/email.helper');
const authHelper = require('../helpers/auth.helper');
const { addTokenToBlacklist } = require('../helpers/redis.helper');
const commonHelpers = require('../helpers/common.helper');
const { EXPIRY, REDIS_OTP_EXPIRY } = require('../constants/auth.constant.js');

// to send otp for login
async function sendOtp(payload) {
	const { email } = payload;
	if (!(await authHelper.validUser(email))) {
		throw commonHelpers.customError('User is not registered', 404);
	}

	// generate otp from helpers
	const otp = await authHelper.generateOtp();

	await reddis.set(email, otp, 'ex', REDIS_OTP_EXPIRY);

	await mail.sendOtp(otp, email);

	return `otp sent successfully, for reference ${otp}`;
}

// to verify otp for login
async function verifyOtp(payload) {
	const { email, otp } = payload;

	const user = await User.findOne({ where: { email: email } });

	if (!user) {
		throw commonHelpers.customError('User is not registered', 404);
	}

	const storedOTP = await reddis.get(email);

	if (!(storedOTP == otp)) {
		throw commonHelpers.customError('OTP did not match', 401);
	}

	reddis.del(email);

	// generating token
	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRATION_TIME,
	});

	return token;
}

// register new user
async function create(payload, image) {
	const { name, about, email } = payload;

	if (await authHelper.validUser(email)) {
		throw commonHelpers.customError('User already registered', 409);
	}

	const response = await User.create({
		name,
		image,
		email,
		about,
	});

	return response;
}

// logout user
async function remove(token) {
	try {
		if (!token) {
			throw commonHelpers.customError('Token is required for logout', 401);
		}

		const decodedToken = jwt.decode(token);

		if (!decodedToken) {
			throw commonHelpers.customError('Invalid token', 401);
		}

		const expiresIn = EXPIRY;

		await addTokenToBlacklist(token, expiresIn);

		return { message: 'Logged out successfully' };
	} catch (error) {
		console.log(error);
		throw commonHelpers.customError('Logout failed', 400);
	}
}

module.exports = { create, sendOtp, verifyOtp, remove };
