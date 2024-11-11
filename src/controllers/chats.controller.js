const { create } = require('../services/chats.service');

async function createChat(req, res) {
	try {
		const { name, description, type, user_ids } = req.body;
		const image = req.file?.path;

		res.status(201).json({ message: 'User has been successfully created' });
	} catch (error) {
		console.log('Error creating the chat', error);
		res.status(400).json({ message: error.message });
	}
}

module.exports = { createChat };
