const { Chat, User, UserChat } = require('../models');

async function createSingle(type, user_ids, loggedInId) {
	const userDetails = await User.findByPk(user_ids[0]);
	console.log(userDetails);
	const name = userDetails.name;
	const image = userDetails.image;
	const description = userDetails.about;

	const chat = await Chat.create({ name, image, description, type });

	await UserChat.bulkCreate([
		{ chat_id: chat.id, user_id: loggedInId, is_admin: true },
		{ chat_id: chat.id, user_id: user_ids[0], is_admin: true },
	]);

	// await UserChat.create({ chat_id: chat.id, user_id: loggedInId });
	// await UserChat.create({ chat_id: chat.id, user_id: user_ids[0] });

	return chat;
}

async function createGroup(
	name,
	description,
	type,
	image,
	user_ids,
	loggedInId,
) {
	user_ids = JSON.parse(user_ids);
	console.log(typeof user_ids);
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
	console.log(chat_id);
	const chat = await Chat.findByPk(chat_id);
	if (chat.type === 'group') {
		return chat;
	} else {
		const userIds = await UserChat.findAll({ chat_id: chat_id });
		console.log(userIds);
		let otherUser;
		userIds.forEach(userId => {
			if (userId.id !== id) {
				otherUser = userId;
			}
		});
		console.log(otherUser.id);

		const user = await User.findByPk(otherUser.id);
		return { user, chat };
	}
}

module.exports = { createSingle, createGroup, find };
