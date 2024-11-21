const { transporter } = require('../utils/email.util');
const commonHelpers = require('../helpers/common.helper');

async function helper(mailOptions) {
	await transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			throw commonHelpers.customError('Error sending mail', 400);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}

async function sendOtp(otp, email) {
	const mailOptions = {
		from: process.env.MAIL_USER,
		to: email,
		subject: 'OTP for Registration',
		text: `Your OTP is ${otp}. It expires in 5 minutes.`,
	};

	await helper(mailOptions);
}

async function invite(name, token, email, chatId) {
	const mailOptions = {
		from: process.env.MAIL_USER,
		to: email,
		subject: `Email invite to be in ${name} group`,
		text: `Join ${name} by accepting the url below.
		http://localhost:5000/joingroup/:${chatId}?${token}`,
	};
	await helper(mailOptions);
}
module.exports = { sendOtp, invite };
