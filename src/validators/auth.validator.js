const Joi = require('joi');

const registerSchema = Joi.object({
	name: Joi.string(),
	about: Joi.string().required(),
	email: Joi.string().email().required(),
});

const sendOTPSchema = Joi.object({
	email: Joi.string().email().required(),
});

const verifyOTPSchema = Joi.object({
	email: Joi.string().email().required(),
	otp: Joi.string().length(6).required(),
});

module.exports = { registerSchema, sendOTPSchema, verifyOTPSchema };
