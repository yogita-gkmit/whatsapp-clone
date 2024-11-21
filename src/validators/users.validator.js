const Joi = require('joi');

const editProfileSchema = Joi.object({
	name: Joi.string().required(),
	about: Joi.string().required(),
	email: Joi.string().email().required(),
});

const queryPageSchema = Joi.object({
	page: Joi.number().integer().optional().positive(),
});
const idParamSchema = Joi.object({
	id: Joi.string().uuid().required(),
});
module.exports = { editProfileSchema, queryPageSchema, idParamSchema };
