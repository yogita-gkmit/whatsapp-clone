const Joi = require('joi');

const editProfileSchema = Joi.object({
	name: Joi.string().required(),
	about: Joi.string().required(),
	email: Joi.string().email().required(),
});

const queryPageSchema = Joi.object({
	page: Joi.number().integer().optional(),
});
module.exports = { editProfileSchema, queryPageSchema };
