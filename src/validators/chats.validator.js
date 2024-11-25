const Joi = require('joi');

const chatIdParamSchema = Joi.object({
	id: Joi.string().uuid().required(),
});

const messageIdParamSchema = Joi.object({
	messageId: Joi.string().uuid().required(),
	id: Joi.string().uuid().required(),
});

const userIdParamSchema = Joi.object({
	userId: Joi.string().uuid().required(),
	id: Joi.string().uuid().required(),
});

const createChatBodySchema = Joi.object({
	type: Joi.string().valid('one-to-one', 'group').required(),
	// user_ids: Joi
	// 	.items(Joi.string().uuid().required())
	// 	.when('type', {
	// 		is: 'one-to-one',
	// 		then: Joi.array().length(1).required(),
	// 		otherwise: Joi.array().min(1).required(),
	// 	}),
	user_ids: Joi.when('type', {
		is: 'one-to-one',
		then: Joi.string().uuid().required(),
		otherwise: Joi.array().items(Joi.string().uuid()).required(),
	}),
	name: Joi.string().when('type', {
		is: 'group',
		then: Joi.string().min(1).required(),
		otherwise: Joi.forbidden(),
	}),
	description: Joi.string().max(500).optional(),
});

const editChatBodySchema = Joi.object({
	name: Joi.string().min(3).optional(),
	description: Joi.string().max(500).optional(),
	image: Joi.string().uri().optional(),
});

const editRoleSchema = Joi.object({
	user_ids: Joi.array().items(Joi.string().uuid().required()).min(1).required(),
});

const addUserBodySchema = Joi.object({
	token: Joi.string().required(),
});

const emailInviteBodySchema = Joi.object({
	user_id: Joi.string().uuid().required(),
});

const createMessageBodySchema = Joi.object({
	message: Joi.string().min(1).max(1000).optional(),
	media: Joi.string().uri().optional(),
});

const editMessageBodySchema = Joi.object({
	message: Joi.string().min(1).max(1000).required(),
	media: Joi.string().uri().optional(),
});

const removeUserBodySchema = Joi.object({
	token: Joi.string().required(),
});

module.exports = {
	chatIdParamSchema,
	messageIdParamSchema,
	userIdParamSchema,
	createChatBodySchema,
	editChatBodySchema,
	editRoleSchema,
	addUserBodySchema,
	emailInviteBodySchema,
	createMessageBodySchema,
	editMessageBodySchema,
	removeUserBodySchema,
};
