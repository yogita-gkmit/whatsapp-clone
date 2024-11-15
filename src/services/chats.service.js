const { Chat, User, UserChat, Message, sequelize } = require('../models');
const { transporter, mailOptions } = require('../utils/email.util');
const commonHelpers = require('../helpers/common.helper');
const { reddis } = require('../config/redis');
const { Op } = require('sequelize');

const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey', {
	encoding: 'base64',
	pbkdf2Iterations: 10000,
	saltLength: 10,
});

async function createSingle(payload, loggedInId) {
	const transaction = await sequelize.transaction();

	try {
		const { type, user_ids: userIds } = payload;

		const userDetails = await User.findByPk(userIds[0]);

		const name = userDetails.name;
		const image = userDetails.image;
		const description = userDetails.about;

		const chat = await Chat.create(
			{ name, image, description, type },
			{ transaction },
		);

		await UserChat.bulkCreate(
			[
				{ chat_id: chat.id, user_id: loggedInId, is_admin: true },
				{ chat_id: chat.id, user_id: userIds[0], is_admin: true },
			],
			{ transaction },
		);

		await transaction.commit();

		return chat;
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function createGroup(payload, image, loggedInId) {
	const transaction = await sequelize.transaction();

	try {
		const { name, description, type } = payload;
		let { user_ids: userIds } = payload;
		// userIds = JSON.parse(userIds);
		const chat = await Chat.create({ name, description, type, image });
		if (!chat) {
			throw commonHelpers.customError('Chat does not exist', 404);
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
		console.log(error);
	}
}

async function find(chatId, id) {
	const chat = await Chat.findByPk(chatId);
	if (!chat) {
		throw commonHelpers.customError('Chat does not exist', 404);
	}
	if (chat.type === 'group') {
		return chat;
	} else {
		const userIds = await UserChat.findAll({ chat_id: chatId });

		let otherUser;
		userIds.forEach(userId => {
			if (userId.id !== id) {
				otherUser = userId;
			}
		});

		const user = await User.findByPk(otherUser.user_id);

		return { user, chat };
	}
}

async function edit(chatId, id, payload, image) {
	const transaction = await sequelize.transaction();

	try {
		const { name, description } = payload;
		const chat = await Chat.findByPk(chatId);
		if (!chat) {
			throw commonHelpers.customError('Chat does not exist', 404);
		}
		if (chat.type === 'one-to-one') {
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
			{
				transaction,
			},
		);
		await transaction.commit();

		return response;
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function remove(chatId, id) {
	const transaction = await sequelize.transaction();

	try {
		const chat = await Chat.findByPk(chatId);
		if (!chat) throw commonHelpers.customError('Chat does not exist', 404);
		if (chat.type === 'one-to-one')
			throw commonHelpers.customError(
				'Can not delete one to one conversation',
				400,
			);

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

		await chat.destroy();
		await transaction.commit();

		return 'Group deleted successfully';
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function editrole(chatId, id, payload) {
	const transaction = await sequelize.transaction();

	try {
		const { user_ids: userIds } = payload;
		const chat = await Chat.findByPk(chatId);
		if (!chat) throw commonHelpers.customError('Chat does not exist', 404);
		if (chat.type === 'one-to-one')
			throw commonHelpers.customError(
				'Not applicable for one to one conversation',
				400,
			);

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
			{
				transaction,
			},
		);
		await transaction.commit();

		return response;
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

// remove transactions from invite
async function invite(chatId, id, payload) {
	const transaction = await sequelize.transaction();

	try {
		const { user_id: userId } = payload;
		const chat = Chat.findByPk(chatId);
		if (!chat) throw commonHelpers.customError('Chat does not exist', 404);
		if (chat.type === 'one-to-one')
			throw commonHelpers.customError(
				'Not applicable for one to one conversation',
				400,
			);

		const usersChat = await UserChat.findOne({
			where: { chat_id: chatId, user_id: id },
		});

		if (!usersChat) {
			throw commonHelpers.customError('User not found', 404);
		} else if (!usersChat?.is_admin) {
			throw commonHelpers.customError('User is not admin', 403);
		}
		const user = await User.findByPk(userId);

		if (!user) throw commonHelpers.customError('User does not exist', 404);
		const token = cryptr.encrypt(userId);
		await reddis.set(userId, token, 'ex', 60 * 60 * 24);

		// TODO: REMOVE
		// console.log(token);
		const mailOptions = {
			from: process.env.MAIL_USER,
			to: user.email,
			subject: `Email invite to be in ${chat.name} group`,
			text: `Join ${chat.name} by accepting the url below.
		http://localhost:5000/joingroup/:${chatId}?${token}`,
		};

		await transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error(error);
				throw commonHelpers.customError('Error sending mail', 400);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});
		await transaction.commit();

		// TO REMOVE: token (temporary)
		return `Mail sent successfully, token: ${token}`;
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function addUser(chatId, id, payload) {
	const transaction = await sequelize.transaction();

	try {
		const { token } = payload;
		const decoded = cryptr.decrypt(token);
		const inviteToken = await reddis.get(id);

		if (!inviteToken) {
			throw commonHelpers.customError('Token expired or invalid', 400);
		}
		const inviteDecoded = await cryptr.decrypt(inviteToken);
		if (decoded !== inviteDecoded) {
			throw commonHelpers.customError('Invalid token', 403);
		}

		if (id !== decoded) {
			throw commonHelpers.customError('Invalid invite', 400);
		}

		const chat = await Chat.findByPk(chatId);
		if (!chat) throw commonHelpers.customError('Chat does not exist', 404);
		if (chat.type === 'one-to-one')
			throw commonHelpers.customError(
				'Not applicable for one to one conversation',
				400,
			);

		const response = await UserChat.create(
			{
				chat_id: chatId,
				user_id: decoded,
				is_admin: false,
			},
			{
				transaction,
			},
		);
		await transaction.commit();
		return response;
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function removeUser(id, chatId, userId) {
	const transaction = await sequelize.transaction();

	try {
		const chat = await Chat.findByPk(chatId);
		if (!chat) throw commonHelpers.customError('Chat does not exist', 404);

		if (chat.type === 'one-to-one')
			throw commonHelpers.customError(
				'Not applicable for one to one conversation',
				400,
			);

		const usersChat = await UserChat.findOne({
			where: { chat_id: chatId, user_id: id },
		});

		if (!usersChat) {
			throw commonHelpers.customError('User not found', 404);
		} else if (!usersChat?.is_admin) {
			throw commonHelpers.customError('User is not admin', 403);
		}

		await UserChat.destroy({
			where: { chat_id: chatId, user_id: userId },
			transaction,
		});
		await transaction.commit();
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function createMessage(chatId, id, payload, media) {
	const transaction = await sequelize.transaction();

	try {
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

		const response = await Message.create(
			{
				user_id: id,
				chat_id: chatId,
				message: message,
				media: media,
			},
			{
				transaction,
			},
		);
		await transaction.commit();
		return response;
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function editMessage(chatId, messageId, id, payload, media) {
	const transaction = await sequelize.transaction();

	try {
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
				media: media,
			},
			{
				where: {
					id: messageId,
					user_id: id,
					chat_id: chatId,
				},
				returning: true,
			},
			{
				transaction,
			},
		);

		if (updateRowCount === 0) {
			throw commonHelpers.customError('Message not found', 404);
		}
		await transaction.commit();
		return updatedMessage;
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

async function deleteMessage(chatId, messageId, id) {
	const transaction = await sequelize.transaction();

	try {
		const lastMessage = await Message.findAll({
			where: { chat_id: chatId, user_id: id },
			order: [['created_at', 'DESC']],
			limit: 1,
			plain: true,
		});
		if (lastMessage.id !== messageId) {
			throw commonHelpers.customError('user can not delete this message', 403);
		}

		await Message.destroy({
			where: { id: messageId, user_id: id, chat_id: chatId },
			transaction,
		});
		await transaction.commit();
		return 'message deleted successfully';
	} catch (error) {
		await transaction.rollback();
		console.log(error);
	}
}

module.exports = {
	createSingle,
	createGroup,
	find,
	edit,
	remove,
	editrole,
	addUser,
	invite,
	removeUser,
	createMessage,
	editMessage,
	deleteMessage,
};
