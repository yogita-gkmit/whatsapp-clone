const chatsService = require('../services/chats.service');

async function createChat(req, res, next) {
	try {
		const payload = req.body;
		const image = req?.file?.path;
		let response;
		const loggedInId = req.user.id;
		response = await chatsService.create(payload, image, loggedInId);

		res.statusCode = 201;
		res.data = response;
		next();
	} catch (error) {
		console.log('Error creating the chat', error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function getChat(req, res, next) {
	try {
		const loggedInId = req.user.id;
		const { id } = req.params;
		const response = await chatsService.find(id, loggedInId);

		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editChat(req, res, next) {
	try {
		const { id } = req.params;
		const loggedInId = req.user.id;
		const payload = req.body;
		const image = req.file?.path;
		const response = await chatsService.edit(id, loggedInId, payload, image);
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
		const { id } = req.params;
		const loggedInId = req.user.id;
		const response = await chatsService.remove(id, loggedInId);
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
		const { id } = req.params;
		const loggedInId = req.user.id;
		const payload = req.body;
		const response = await chatsService.editrole(id, loggedInId, payload);
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
		const { id } = req.params;
		const { token } = req.query;
		const loggedInId = req.user.id;
		const response = await chatsService.addUser(id, loggedInId, token);

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
		const { id } = req.params;
		const loggedInId = req.user.id;
		const payload = req.body;
		const response = await chatsService.invite(id, loggedInId, payload);
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
		const { id, userId } = req.params;
		const loggedInId = req.user.id;
		const response = await chatsService.removeUser(loggedInId, id, userId);
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
		const { id } = req.params;
		const media = req.file?.path;
		const loggedInId = req.user.id;
		const payload = req.body;
		const response = await chatsService.createMessage(
			id,
			loggedInId,
			payload,
			media,
		);
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
		const { id, messageId } = req.params;
		const loggedInId = req.user.id;
		const payload = req.body;
		const response = await chatsService.editMessage(
			id,
			messageId,
			loggedInId,
			payload,
		);
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
		const { id, messageId } = req.params;
		const loggedInId = req.user.id;
		const response = await chatsService.deleteMessage(
			id,
			messageId,
			loggedInId,
		);
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
		const { id } = req.params;
		const { page, filter } = req.query;
		const loggedInId = req.user.id;
		const response = await chatsService.displayMessages(
			id,
			loggedInId,
			page,
			filter,
		);
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
