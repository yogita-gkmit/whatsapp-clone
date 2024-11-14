const Joi = require('joi');

const editProfileSchema = Joi.object({
	name: Joi.string(),
	about: Joi.string(),
	email: Joi.string().email(),
});

const queryPageSchema = Joi.object({
	page: Joi.number().integer().optional(),
});
module.exports = { editProfileSchema, queryPageSchema };
