const chatsService = require('../services/chats.service');

async function createChat(req, res) {
	try {
		const payload = req.body;
		const { type } = payload;
		const image = req.file?.path;
		let response;
		const loggedInId = req.user.id;
		if (type === 'one-to-one') {
			response = await chatsService.createSingle(payload, loggedInId);
		} else {
			response = await chatsService.createGroup(payload, image, loggedInId);
		}
		res
			.status(201)
			.json({ message: 'User has been successfully created', response });
	} catch (error) {
		console.log('Error creating the chat', error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function getChat(req, res) {
	try {
		const id = req.user.id;
		const { chat_id } = req.params;
		const response = await chatsService.find(chat_id, id);
		res
			.status(200)
			.json({ message: 'successfully getting the chat', response });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editChat(req, res) {
	try {
		const { chat_id } = req.params;
		const id = req.user.id;
		const payload = req.body;
		const image = req.file?.path;
		await chatsService.edit(chat_id, id, payload, image);
		res.status(202).json({ message: 'successfully edited the group chat' });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function deleteChat(req, res) {
	try {
		const { chat_id } = req.params;
		const id = req.user.id;
		await chatsService.remove(chat_id, id);
		res.status(202).json({ message: 'successfully deleted the group chat' });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editAdmin(req, res) {
	try {
		const { chat_id } = req.params;
		const id = req.user.id;
		const payload = req.body;
		await chatsService.editrole(chat_id, id, payload);
		res.status(202).json({ message: 'successfully edited the group admin' });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

// here token is what generated in email invite and i have to login as the user im adding to hit the api
async function addUser(req, res) {
	try {
		const { chat_id } = req.params;
		const id = req.user.id;
		const payload = req.body;
		await chatsService.addUserToGroup(chat_id, id, payload);
		res.status(201).json({ message: 'successfully added user in chat' });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function emailInvite(req, res) {
	try {
		const { chat_id } = req.params;
		const id = req.user.id;
		const payload = req.body;
		await chatsService.invite(chat_id, id, payload);
		res.status(200).json({ message: 'successfully sent invite to the email' });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function removeUser(req, res) {
	try {
		const { chat_id, user_id } = req.params;
		const id = req.user.id;
		await chatsService.removeUserFromgroup(id, chat_id, user_id);
		res.status(202).json({ message: 'successfully removed the user' });
	} catch (error) {
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

module.exports = {
	createChat,
	getChat,
	editChat,
	deleteChat,
	editAdmin,
	addUser,
	emailInvite,
	removeUser,
};
