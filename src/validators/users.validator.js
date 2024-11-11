const joi = require('joi');

const editProfileSchema = joi.object({
	name: joi.string(),
	about: joi.string(),
	email: joi.string().email(),
});

module.exports = { editProfileSchema };
