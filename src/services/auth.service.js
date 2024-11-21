const User = require('../models').User;
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { reddis } = require('../config/redis');
const { sequelize } = require('../models');
const mail = require('../helpers/email.helper');
const { validUser } = require('../helpers/auth.helper');
const { addTokenToBlacklist } = require('../helpers/redis.helper');
const commonHelpers = require('../helpers/common.helper');

const dotenv = require('dotenv');
dotenv.config();

async function generateOtp() {
	let otp = otpGenerator.generate(6, {
		upperCaseAlphabets: false,
		lowerCaseAlphabets: false,
		specialChars: false,
	});
	return otp;
}

async function sendOtp(payload) {
	const { email } = payload;
	if (!(await validUser(email))) {
		throw commonHelpers.customError('User is not registered', 404);
	}
	const otp = await generateOtp();
	await reddis.set(email, otp, 'ex', 300);

	const storedOTP = await reddis.get(email);
	await mail.sendOtp(otp, email);
	return { message: 'otp sent successfully', otp };
}

async function verifyOtp(payload) {
	const { email, otp } = payload;
	const user = await User.findOne({ where: { email: email } });
	if (!user) {
		throw commonHelpers.customError('User is not registered', 404);
	}

	const storedOTP = await reddis.get(email);

	if (!(storedOTP == otp)) {
		throw commonHelpers.customError('OTP did not match', 400);
	}
	reddis.del(email);
	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: '170h',
	});

	return token;
}

async function create(payload, image) {
	const transaction = await sequelize.transaction();

	try {
		const { name, about, email } = payload;
		if (await validUser(email)) {
			throw commonHelpers.customError('User already registered', 400);
		}
		const response = await User.create(
			{
				name,
				image,
				email,
				about,
			},
			{ transaction },
		);
		await transaction.commit();

		return response;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

async function remove(token) {
	if (!token) {
		throw commonHelpers.customError('Token is required for logout', 401);
	}
	try {
		const decodedToken = jwt.decode(token);
		if (!decodedToken) {
			throw commonHelpers.customError('Invalid token', 401);
		}
		const expiresIn = 3600;
		await addTokenToBlacklist(token, expiresIn);

		return { message: 'Logged out successfully' };
	} catch (error) {
		console.log(error);
		throw commonHelpers.customError('Logout failed', 400);
	}
}

module.exports = { create, sendOtp, verifyOtp, remove };
