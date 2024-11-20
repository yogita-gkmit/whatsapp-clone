const chatsService = require('../services/chats.service');

async function createChat(req, res, next) {
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
		res.statusCode = 201;
		res.data = response;
		next();
		// res
		// 	.status(201)
		// 	.json({ message: 'User has been successfully created', response });
	} catch (error) {
		console.log('Error creating the chat', error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function getChat(req, res, next) {
	try {
		const id = req.user.id;
		const { chatId } = req.params;
		const response = await chatsService.find(chatId, id);

		res.statusCode = 200;
		res.data = response;
		next();
		// res
		// 	.status(200)
		// 	.json({ message: 'successfully getting the chat', response });
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editChat(req, res, next) {
	try {
		const { chatId } = req.params;
		const id = req.user.id;
		const payload = req.body;
		const image = req.file?.path;
		const response = await chatsService.edit(chatId, id, payload, image);
		// res.status(202).json({ message: 'successfully edited the group chat' });

		res.statusCode = 202;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function deleteChat(req, res, next) {
	try {
		const { chatId } = req.params;
		const id = req.user.id;
		const response = await chatsService.remove(chatId, id);
		// res
		// 	.status(202)
		// 	.json({ message: 'successfully deleted the group chat', response });

		res.statusCode = 202;
		res.data = { message: 'successfully deleted the group chat', response };
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editAdmin(req, res, next) {
	try {
		const { chatId } = req.params;
		const id = req.user.id;
		const payload = req.body;
		const response = await chatsService.editrole(chatId, id, payload);
		// res.status(202).json({ message: 'successfully edited the group admin' });
		res.statusCode = 202;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

// here token is what generated in email invite and i have to login as the user im adding to hit the api
async function addUser(req, res, next) {
	try {
		const { chatId } = req.params;
		const id = req.user.id;
		const payload = req.body;
		const response = await chatsService.addUser(chatId, id, payload);
		console.log(chatId, id, payload);
		// res.status(201).json({ message: 'successfully added user in chat' });
		res.statusCode = 201;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function emailInvite(req, res, next) {
	try {
		const { chatId } = req.params;
		const id = req.user.id;
		const payload = req.body;
		const response = await chatsService.invite(chatId, id, payload);
		// res.status(200).json({ message: 'successfully sent invite to the email' });
		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function removeUser(req, res, next) {
	try {
		const { chatId, userId } = req.params;
		const id = req.user.id;
		const response = await chatsService.removeUser(id, chatId, userId);
		// res.status(202).json({ message: 'successfully removed the user' });
		res.statusCode = 202;
		res.data = { message: 'successfully removed the user', response };
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function createMessage(req, res, next) {
	try {
		const { chatId } = req.params;
		const media = req.file?.path;
		const id = req.user.id;
		const payload = req.body;
		const response = await chatsService.createMessage(
			chatId,
			id,
			payload,
			media,
		);
		// res.status(201).json({ message: 'successfully added the message' });
		res.statusCode = 202;
		res.data = { message: 'successfully added the message', response };
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editMessage(req, res, next) {
	try {
		const { chatId, messageId } = req.params;
		const media = req.file?.path;
		const id = req.user.id;
		const payload = req.body;
		const response = await chatsService.editMessage(
			chatId,
			messageId,
			id,
			payload,
			media,
		);
		// res.status(200).json({ message: 'Message edited successfully', response });
		res.statusCode = 200;
		res.data = {
			message: 'Message edited successfully',
			response: response[0],
		};
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function deleteMessage(req, res, next) {
	try {
		const { chatId, messageId } = req.params;
		const id = req.user.id;
		const response = await chatsService.deleteMessage(chatId, messageId, id);
		// res.status(200).json({ message: response });

		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}
async function displayMessages(req, res, next) {
	try {
		const { chatId } = req.params;
		const { page, filter } = req.query;
		const id = req.user.id;

		const response = await chatsService.displayMessages(
			chatId,
			id,
			page,
			filter,
		);
		// res.status(200).json({ message: response });
		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
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
	createMessage,
	editMessage,
	deleteMessage,
	displayMessages,
};
