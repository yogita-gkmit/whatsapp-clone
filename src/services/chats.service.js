const { Chat, User, UserChat, Message, sequelize } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { reddis } = require('../config/redis');
const { Op, Sequelize } = require('sequelize');
const mail = require('../helpers/email.helper');
const { SINGLE, GROUP } = require('../constants/chats.constant.js');
const Cryptr = require('cryptr');

const cryptr = new Cryptr(process.env.CRYPTR_KEY, {
	encoding: 'base64',
	pbkdf2Iterations: 10000,
	saltLength: 10,
});

// to create chat one-to-one and group both
async function create(payload, image, loggedInId) {
	const transaction = await sequelize.transaction();

	try {
		let { name, description, type } = payload;
		let { user_ids: userIds } = payload;

		let chat;

		if (type === SINGLE) {
			// to check if the one-to-one chat already exists
			const results = await Chat.findAll({
				attributes: ['id'],
				include: [
					{
						model: User,
						attributes: [],
						through: {
							attributes: [],
						},
						where: {
							id: {
								[Op.in]: [loggedInId, userIds],
							},
						},
						required: true,
					},
				],
				where: {
					type: 'one-to-one',
				},
				having: Sequelize.literal('COUNT(*) > 1'),
				group: ['Chat.id'],
			});

			if (Array.isArray(results) && results.length > 0) {
				throw commonHelpers.customError('Chat already exists', 409);
			}

			chat = await User.findByPk(loggedInId);

			if (!chat) {
				throw commonHelpers.customError('User does not found', 404);
			}
			name = chat.name;
			image = chat.image;
			description = chat.about;
		}

		if (!Array.isArray(userIds)) {
			userIds = [userIds];
		}

		chat = await Chat.create({ name, description, type, image });

		if (!chat) {
			throw commonHelpers.customError('Chat creation failed', 400);
		}

		await UserChat.create(
			{
				chat_id: chat.id,
				user_id: loggedInId,
				is_admin: true,
			},
			{ transaction },
		);

		await Promise.all(
			userIds.map(id => {
				return UserChat.create(
					{
						chat_id: chat.id,
						user_id: id,
						is_admin: false,
					},
					{ transaction },
				);
			}),
		);

		await transaction.commit();

		return chat;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

// to display a chat
async function find(chatId, id) {
	const chat = await Chat.findByPk(chatId);

	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}

	if (chat.type === GROUP) {
		return chat;
	} else {
		const userIds = await UserChat.findAll({ chat_id: chatId });
		let flag = false;
		let otherUser;
		userIds.forEach(userId => {
			if (id === userId.id) {
				flag = true;
			}
			if (userId.id !== id) {
				otherUser = userId;
			}
		});

		if (flag === false) {
			throw commonHelpers.customError('User does not exist in chat', 403);
		}

		const user = await User.findByPk(otherUser.user_id);

		return { user, chat };
	}
}

// to edit a chat
async function edit(chatId, id, payload, image) {
	const { name, description } = payload;
	const chat = await Chat.findByPk(chatId);
	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}
	if (chat.type === SINGLE) {
		throw commonHelpers.customError('Only a group chat can be edited', 400);
	}

	const usersChat = await UserChat.findOne({
		where: { user_id: id, chat_id: chatId },
	});
	if (!usersChat) {
		throw commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		throw commonHelpers.customError('User is not admin', 403);
	}

	const response = await Chat.update(
		{ name: name, image: image, description: description },
		{
			where: { id: chatId },
			returning: true,
		},
	);

	return response;
}

// to remove a chat
async function remove(chatId, id) {
	const transaction = await sequelize.transaction();

	try {
		const chat = await Chat.findByPk(chatId);
		if (!chat) {
			throw commonHelpers.customError('Chat does not exist', 404);
		}

		const usersChat = await UserChat.findOne({
			where: { user_id: id, chat_id: chatId },
		});
		if (!usersChat) {
			throw commonHelpers.customError('User not found', 404);
		} else if (!usersChat?.is_admin) {
			throw commonHelpers.customError('User is not admin', 403);
		}
		await UserChat.destroy({
			where: { chat_id: chatId },
			transaction,
		});

		const deleteCount = await chat.destroy({ transaction });
		await transaction.commit();

		return deleteCount;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

// to edit admin
async function editRole(chatId, id, payload) {
	const { user_ids: userIds } = payload;
	const chat = await Chat.findByPk(chatId);
	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}
	if (chat.type === SINGLE) {
		throw commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);
	}

	const usersChat = await UserChat.findOne({
		where: { user_id: id, chat_id: chatId },
	});
	if (!usersChat) {
		throw commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		throw commonHelpers.customError('User is not admin', 403);
	}
	const response = await UserChat.update(
		{
			is_admin: true,
		},
		{
			where: { chat_id: chat.id, user_id: { [Op.in]: userIds } },
			returning: true,
		},
	);
	return response;
}

// invite sent to add user in chat
async function invite(chatId, id, payload) {
	const { user_id: userId } = payload;
	const chat = Chat.findByPk(chatId);

	if (!id) {
		throw commonHelpers.customError('Token does not exists', 400);
	}
	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}
	if (chat.type === SINGLE) {
		throw commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);
	}
	const usersChat = await UserChat.findOne({
		where: { chat_id: chatId, user_id: id },
	});

	if (!usersChat) {
		throw commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		throw commonHelpers.customError('User is not admin', 403);
	}
	const user = await User.findByPk(userId);

	if (!user) {
		throw commonHelpers.customError('User does not exist', 404);
	}
	const token = cryptr.encrypt(userId);
	await reddis.set(userId, token, 'ex', 60 * 60 * 24);
	const name = chat.name;
	const email = user.email;
	await mail.invite(name, token, email, chatId);

	return token;
}

// to add user in chat after invite accepted
async function addUser(chatId, id, token) {
	const decoded = cryptr.decrypt(token);
	const inviteToken = await reddis.get(id);

	if (!inviteToken) {
		throw commonHelpers.customError('Token expired or invalid', 401);
	}
	const inviteDecoded = await cryptr.decrypt(inviteToken);
	if (decoded !== inviteDecoded) {
		throw commonHelpers.customError('Invalid token', 403);
	}

	if (id !== decoded) {
		throw commonHelpers.customError('Invalid invite', 400);
	}

	const chat = await Chat.findByPk(chatId);
	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}
	if (chat.type === SINGLE) {
		throw commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);
	}
	const response = await UserChat.create({
		chat_id: chatId,
		user_id: decoded,
		is_admin: false,
	});

	return response;
}

// to remove user from chat, only admin can remove
async function removeUser(id, chatId, userId) {
	const chat = await Chat.findByPk(chatId);
	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}

	if (chat.type === SINGLE) {
		throw commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);
	}
	const usersChat = await UserChat.findOne({
		where: { chat_id: chatId, user_id: id },
	});

	if (!usersChat) {
		throw commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		throw commonHelpers.customError('User is not admin', 403);
	}

	const deleteCount = await UserChat.destroy({
		where: { chat_id: chatId, user_id: userId },
	});

	return deleteCount;
}

// to create message
async function createMessage(chatId, id, payload, media) {
	const { message } = payload;

	const chat = await Chat.findByPk(chatId);
	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}
	const user = await User.findByPk(id);

	if (!user) {
		throw commonHelpers.customError('User does not exist', 404);
	}

	const usersChat = await UserChat.findOne({
		where: { chat_id: chatId, user_id: id },
	});

	if (!usersChat) {
		throw commonHelpers.customError('User not found in chat', 404);
	}
	let response;

	if (message || media) {
		response = await Message.create({
			user_id: id,
			chat_id: chatId,
			message: message,
			media: media,
		});
	} else {
		throw commonHelpers.customError('message should not be empty', 422);
	}

	return response;
}

// to edit last message
async function editMessage(chatId, messageId, id, payload) {
	const { message } = payload;

	const lastMessage = await Message.findAll({
		where: { chat_id: chatId, user_id: id },
		order: [['created_at', 'DESC']],
		limit: 1,
		plain: true,
	});

	if (lastMessage.id !== messageId) {
		throw commonHelpers.customError('user can not edit this message', 403);
	}

	const [updateRowCount, updatedMessage] = await Message.update(
		{
			message: message,
		},
		{
			where: {
				id: messageId,
				user_id: id,
				chat_id: chatId,
			},
			returning: true,
		},
	);

	if (updateRowCount === 0) {
		throw commonHelpers.customError('Message not found', 404);
	}

	return updatedMessage;
}

// to delete message
async function deleteMessage(chatId, messageId, id) {
	const lastMessage = await Message.findAll({
		where: { chat_id: chatId, user_id: id },
		order: [['created_at', 'DESC']],
		limit: 1,
	});

	if (!lastMessage || lastMessage.length === 0) {
		throw commonHelpers.customError('Message not found', 404);
	}

	if (lastMessage[0]?.id !== messageId) {
		throw commonHelpers.customError('user can not delete this message', 403);
	}

	const deleteCount = await Message.destroy({
		where: { id: messageId, user_id: id, chat_id: chatId },
	});

	return deleteCount;
}

// to display all messages
async function displayMessages(chatId, id, page = 0, filter) {
	if (!chatId) {
		throw commonHelpers.customError('chat does not exist', 404);
	}

	const user = await UserChat.findOne({
		where: { chat_id: chatId, user_id: id },
	});

	if (!user) {
		throw commonHelpers.customError('user can not access this chat', 403);
	}

	const limit = 4;
	const offset = limit * page;
	let message;
	if (filter === 'message') {
		message = await Message.findAndCountAll({
			where: {
				chat_id: chatId,
				message: {
					[Op.like]: '%',
				},
			},
			offset: offset,
			limit: limit,
		});
	} else if (filter === 'media') {
		message = await Message.findAndCountAll({
			where: {
				chat_id: chatId,
				media: {
					[Op.like]: '%',
				},
			},
			offset: offset,
			limit: limit,
		});
	} else {
		message = await Message.findAndCountAll({
			where: { chat_id: chatId },
			offset: offset,
			limit: limit,
		});
	}

	return {
		totalItems: message.count,
		totalPages: Math.ceil(message.count / limit),
		currentPage: parseInt(page),
		messages: message.rows,
	};
}

module.exports = {
	create,
	find,
	edit,
	remove,
	editRole,
	addUser,
	invite,
	removeUser,
	createMessage,
	editMessage,
	deleteMessage,
	displayMessages,
};
