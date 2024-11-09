const User = require('../models').User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { reddis } = require('../config/redis');
const { transporter, mailOptions } = require('../utils/email.util');
const { validUser } = require('../helpers/auth.helper');

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
async function sendToMail(email) {
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
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	return { message: 'otp sent successfully' };
}

async function verify(email, otp) {
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

async function create(name, image, about, email, otp) {
	const record = await client.get(email);
	if (!record) throw new Error('Invalid or Expired Otp');

	if (record === otp) {
		const user = new User({ name, image, about, email });
		await user.save();
	} else {
		throw new Error('Incorrect Otp Entered');
	}
}

module.exports = { create, sendToMail, generateOtp, verify };
