const {
	createSingle,
	createGroup,
	find,
} = require('../services/chats.service');

async function createChat(req, res) {
	try {
		const { name, description, type, user_ids } = req.body;
		const image = req.file?.path;
		let response;
		const loggedInId = req.user.id;
		if (type === 'one-to-one') {
			response = await createSingle(type, user_ids, loggedInId);
		} else {
			response = await createGroup(
				name,
				description,
				type,
				image,
				user_ids,
				loggedInId,
			);
		}
		res
			.status(201)
			.json({ message: 'User has been successfully created', response });
	} catch (error) {
		console.log('Error creating the chat', error);
		res.status(400).json({ message: error.message });
	}
}

async function getChat(req, res) {
	try {
		const id = req.user.id;
		const { chat_id } = req.params;
		const response = await find(chat_id, id);
		res
			.status(200)
			.json({ message: 'successfully getting the chat', response });
	} catch (error) {
		console.log('Error getting the chat', error);
		res.status(400).json({ message: error.message });
	}
}

module.exports = { createChat, getChat };
