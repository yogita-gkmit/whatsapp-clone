const joi = require('joi');

const registerSchema = joi.object({
	name: joi.string(),
	about: joi.string().required(),
	email: joi.string().email().required(),
});

const sendOTPSchema = joi.object({
	email: joi.string().email().required(),
});

const verifyOTPSchema = joi.object({
	email: joi.string().email().required(),
	otp: joi.string().length(6).required(),
});

module.exports = { registerSchema, sendOTPSchema, verifyOTPSchema };
