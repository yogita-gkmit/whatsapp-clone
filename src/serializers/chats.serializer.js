async function createChat(req, res, next) {
	const receivedData = res.data || [];

	if (Array.isArray(receivedData)) {
		const resultData = receivedData.map(item => ({
			id: item.id,
			name: item.name,
			description: item.description,
			image: item.image,
			type: item.type,
			createdAt: item.created_at,
			updatedAt: item.updated_at,
		}));
		res.data = { message: 'Operation successful', data: resultData };
	} else if (receivedData && typeof receivedData === 'object') {
		const resultData = {
			id: receivedData.id,
			name: receivedData.name,
			description: receivedData.description || '',
			type: receivedData.type || 'one-to-one',
			image: receivedData.image || null,
			createdAt: receivedData.created_at,
			updatedAt: receivedData.updated_at,
		};
		res.data = { data: resultData };
	}

	next();
}

async function getChat(req, res, next) {
	const chatData = res.data || [];

	let result;
	if (chatData.type === 'group') {
		result = {
			id: chatData.id,
			name: chatData.name,
			type: chatData.type,
			description: chatData.description,
			createdAt: chatData.created_at,
			updatedAt: chatData.updated_at,
		};
	} else {
		result = {
			id: chatData.user.id,
			name: chatData.user.name,
			email: chatData.user.email,
			image: chatData.user.image || null,
			createdAt: chatData.created_at,
			updatedAt: chatData.updated_at,
		};
	}

	res.data = { data: result };
	next();
}

async function createMessage(req, res, next) {
	const receivedData = res.data || {};

	const resultData = {
		id: receivedData.id,
		message: receivedData.message,
		media: receivedData.media || null,
		senderId: receivedData.senderId,
		chatId: receivedData.chatId,
		timestamp: receivedData.timestamp,
		createdAt: receivedData.created_at,
		updatedAt: receivedData.updated_at,
	};

	res.data = { message: 'Message created successfully', data: resultData.data };
	next();
}

async function editMessage(req, res, next) {
	const receivedData = res.data || {};
	const resultData = {
		id: receivedData.id,
		message: receivedData.message,
		media: receivedData.media || null,
		senderId: receivedData.senderId,
		chatId: receivedData.chatId,
		timestamp: receivedData.timestamp,
		createdAt: receivedData.created_at,
		updatedAt: receivedData.updated_at,
	};

	res.data = { data: resultData.data };
	next();
}

async function deleteMessage(req, res, next) {
	const receivedData = res.data || {};

	res.data = {
		message: 'Message deleted successfully',
		data: receivedData.data,
	};
	next();
}

async function addUser(req, res, next) {
	const receivedData = res.data || [];
	console.log(receivedData);
	const resultData = {
		id: receivedData.id,
		chatId: receivedData.chat_id,
		userID: receivedData.user_id,
		isAdmin: receivedData.is_admin || 'member',
		createdAt: receivedData.created_at,
		updatedAt: receivedData.updated_at,
	};

	res.data = { data: resultData };
	next();
}

async function removeUser(req, res, next) {
	const receivedData = res.data || {};

	res.data = { data: receivedData.data };
	next();
}

async function editChat(req, res, next) {
	const receivedData = res.data || {};
	console.log(receivedData);
	const resultData = {
		id: receivedData.id,
		name: receivedData.name,
		description: receivedData.description || '',
		type: receivedData.type || 'one-to-one',
		image: receivedData.image || null,
		createdAt: receivedData.created_at,
		updatedAt: receivedData.updated_at,
	};

	res.data = { message: 'Chat updated successfully' };
	next();
}

async function deleteChat(req, res, next) {
	const receivedData = res.data || {};

	res.data = { data: receivedData };
	next();
}

async function editAdmin(req, res, next) {
	const receivedData = res.data || {};
	console.log('admin data', receivedData[1]);
	const data = receivedData[1][0];
	const resultData = {
		id: data.id,
		userId: data.user_id,
		chatId: data.chat_id,
		isAdmin: data.is_admin,
		createdAt: data.created_at,
		updatedAt: data.updated_at,
	};
	res.data = {
		data: resultData,
	};
	next();
}

async function emailInvite(req, res, next) {
	const receivedData = res.data || {};

	res.data = { data: receivedData };
	next();
}

async function displayMessages(req, res, next) {
	const receivedData = res.data || [];

	const resultData = receivedData.messages.map(message => ({
		id: message.id,
		message: message.message,
		media: message.media || null,
		userId: message.user_id,
		createdAt: receivedData.created_at,
		updatedAt: receivedData.updated_at,
		chatId: message.chat_id,
	}));

	const page = {
		totalItems: receivedData.totalItems,
		totalPages: receivedData.totalPages,
		currentPage: receivedData.currentPage,
	};

	res.data = {
		data: resultData,
		page: page,
	};
	next();
}

module.exports = {
	createChat,
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
	getChat,
};
