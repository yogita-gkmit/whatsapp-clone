const { Chat, User, UserChat } = require('../models');
const { transporter, mailOptions } = require('../utils/email.util');
const jwt = require('jsonwebtoken');
const commonHelpers = require('../helpers/common.helper');

async function createSingle(payload, loggedInId) {
	const { type, user_ids } = payload;
	const userDetails = await User.findByPk(user_ids[0]);

	const name = userDetails.name;
	const image = userDetails.image;
	const description = userDetails.about;

	const chat = await Chat.create({ name, image, description, type });

	await UserChat.bulkCreate([
		{ chat_id: chat.id, user_id: loggedInId, is_admin: true },
		{ chat_id: chat.id, user_id: user_ids[0], is_admin: true },
	]);

	return chat;
}

async function createGroup(payload, image, loggedInId) {
	const { name, description, type } = payload;
	let { user_ids } = payload;
	user_ids = JSON.parse(user_ids);
	const chat = await Chat.create({ name, description, type, image });
	await UserChat.create({
		chat_id: chat.id,
		user_id: loggedInId,
		is_admin: true,
	});
	await Promise.all(
		user_ids.map(id => {
			return UserChat.create({
				chat_id: chat.id,
				user_id: id,
				is_admin: false,
			});
		}),
	);

	return chat;
}

async function find(chat_id, id) {
	const chat = await Chat.findByPk(chat_id);
	if (chat.type === 'group') {
		return chat;
	} else {
		const userIds = await UserChat.findAll({ chat_id: chat_id });

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

async function edit(chat_id, id, payload, image) {
	const { name, description } = payload;
	const chat = await Chat.findByPk(chat_id);
	if (!chat) {
		commonHelpers.customError('Chat does not exist', 404);
	}
	if (chat.type === 'one-to-one') {
		commonHelpers.customError('Only a group chat can be edited', 400);
	}

	const usersChat = await UserChat.findOne({
		where: { user_id: id, chat_id: chat_id },
	});
	if (!usersChat) {
		commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		commonHelpers.customError('User is not admin', 403);
	}

	chat.name = name || chat.name;
	chat.description = description || chat.description;
	chat.image = image || chat.image;

	await chat.save();
}

async function remove(chat_id, id) {
	const chat = await Chat.findByPk(chat_id);
	if (!chat) commonHelpers.customError('Chat does not exist', 404);
	if (chat.type === 'one-to-one')
		commonHelpers.customError('Can not delete one to one conversation', 400);

	const usersChat = await UserChat.findOne({
		where: { user_id: id, chat_id: chat_id },
	});
	if (!usersChat) {
		commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		commonHelpers.customError('User is not admin', 403);
	}
	await UserChat.destroy({ where: { chat_id: chat_id } });
	await chat.destroy();
}

async function editrole(chat_id, id, payload) {
	const { user_ids } = payload;
	const chat = await Chat.findByPk(chat_id);
	if (!chat) commonHelpers.customError('Chat does not exist', 404);
	if (chat.type === 'one-to-one')
		commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);

	const usersChat = await UserChat.findOne({
		where: { user_id: id, chat_id: chat_id },
	});
	if (!usersChat) {
		commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		commonHelpers.customError('User is not admin', 403);
	}

	await Promise.all(
		user_ids.map(id => {
			return UserChat.update(
				{
					is_admin: true,
				},
				{ where: { chat_id: chat.id, user_id: id } },
			);
		}),
	);
}

async function invite(chat_id, id, payload) {
	const { user_id } = payload;
	const chat = Chat.findByPk(chat_id);
	if (!chat) commonHelpers.customError('Chat does not exist', 404);
	if (chat.type === 'one-to-one')
		commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);

	const usersChat = await UserChat.findOne({
		where: { chat_id: chat_id, user_id: id },
	});

	if (!usersChat) {
		commonHelpers.customError('User not found', 404);
	} else if (!usersChat?.is_admin) {
		commonHelpers.customError('User is not admin', 403);
	}
	const user = await User.findByPk(user_id);

	if (!user) commonHelpers.customError('User does not exist', 404);
	const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	});

	const mailOptions = {
		from: process.env.MAIL_USER,
		to: user.email,
		subject: `Email invite to be in ${chat.name} group`,
		text: `Join ${chat.name} by accepting the url below.
		http://localhost:5000/joingroup/:${chat_id}?${token}`,
	};
	await transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			commonHelpers.customError('Error sending mail', 400);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}

async function addUser(chat_id, id, payload) {
	const { token } = payload;
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	if (!decoded) {
		commonHelpers.customError('Invalid invite token', 400);
	}

	if (id !== decoded.user_id) {
		commonHelpers.customError('Invalid invite', 400);
	}

	const chat = await Chat.findByPk(chat_id);
	if (!chat) commonHelpers.customError('Chat does not exist', 404);
	if (chat.type === 'one-to-one')
		commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);

	await UserChat.create({
		chat_id: chat_id,
		user_id: decoded.user_id,
		is_admin: false,
	});
}

async function removeUser(id, chat_id, user_id) {
	const chat = await Chat.findByPk(chat_id);
	if (!chat) commonHelpers.customError('Chat does not exist', 404);

	if (chat.type === 'one-to-one')
		commonHelpers.customError(
			'Not applicable for one to one conversation',
			400,
		);

	const usersChat = await UserChat.findOne({
		where: { chat_id: chat_id, user_id: id },
	});

	if (!usersChat) {
		commonHelpers.customError('User not found', 404);
	} else if (usersChat?.is_admin === false) {
		commonHelpers.customError('User is not admin', 403);
	}

	await UserChat.destroy({
		where: { chat_id: chat_id, user_id: user_id },
	});
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
};
