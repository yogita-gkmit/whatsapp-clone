async function createChat(req, res, next) {
	const receivedData = res.data || [];

	if (Array.isArray(receivedData)) {
		const resultData = receivedData.map(item => ({
			id: item.id,
			name: item.name,
			description: item.description,
			image: item.image,
			type: item.type,
		}));
		res.data = { message: 'Operation successful', data: resultData };
	} else if (receivedData && typeof receivedData === 'object') {
		const resultData = {
			id: receivedData.id,
			name: receivedData.name,
			description: receivedData.description || '',
			type: receivedData.type || 'one-to-one',
			image: receivedData.image || null,
		};
		res.data = { message: 'Operation successful', data: resultData };
	}

	next();
}

async function getChat(req, res, next) {
	const chatData = res.data || [];

	console.log(chatData);
	let result;
	if (chatData.type === 'group') {
		result = {
			chat: {
				id: chatData.id,
				name: chatData.name,
				type: chatData.type,
				description: chatData.description,
				createdAt: chatData.created_at,
				updatedAt: chatData.updated_at,
			},
			user: null, // No single user needed for group chat
		};
	} else {
		result = {
			id: chatData.user.id,
			name: chatData.user.name,
			email: chatData.user.email,
			image: chatData.user.image || null,
		};
	}

	res.data = { message: 'Message created successfully', data: result };
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
	};

	res.data = { message: 'Message created successfully', data: resultData };
	next();
}

async function editMessage(req, res, next) {
	const receivedData = res.data || {};
	console.log('>>>>>>>>>>>>>>>>>>', receivedData);
	const resultData = {
		id: receivedData.id,
		message: receivedData.message,
		media: receivedData.media || null,
		senderId: receivedData.senderId,
		chatId: receivedData.chatId,
		timestamp: receivedData.timestamp,
	};

	res.data = { message: 'Message edited successfully', data: resultData };
	next();
}

async function deleteMessage(req, res, next) {
	const receivedData = res.data || {};

	res.data = { message: 'Message deleted successfully', data: receivedData };
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
	};

	res.data = { message: 'User(s) added successfully', data: resultData };
	next();
}

async function removeUser(req, res, next) {
	const receivedData = res.data || {};

	res.data = { message: 'User removed successfully', data: receivedData };
	next();
}

async function editChat(req, res, next) {
	const receivedData = res.data || {};
	console.log(receivedData[1][0]);
	const resultData = {
		id: receivedData[1][0].id,
		name: receivedData[1][0].name,
		description: receivedData[1][0].description || '',
		type: receivedData[1][0].type || 'one-to-one',
		image: receivedData[1][0].image || null,
		updatedAt: receivedData[1][0].updated_at || '',
	};

	res.data = { message: 'Chat updated successfully', data: resultData };
	next();
}

async function deleteChat(req, res, next) {
	const receivedData = res.data || {};

	res.data = { message: 'Chat deleted successfully', data: receivedData };
	next();
}

async function editAdmin(req, res, next) {
	const receivedData = res.data || {};

	res.data = {
		message: 'Admin role updated successfully',
		data: receivedData,
	};
	next();
}

async function emailInvite(req, res, next) {
	const receivedData = res.data || {};

	res.data = { message: 'Invite sent successfully', data: receivedData };
	next();
}

async function displayMessages(req, res, next) {
	const receivedData = res.data || [];
	console.log('>>>>>>>>>>>>>>>>>>>', receivedData);
	const resultData = receivedData.map(message => ({
		id: message.id,
		message: message.message,
		media: message.media || null,
		userId: message.user_id,
		createdAt: message.created_at,
		chatId: message.chat_id,
	}));

	res.data = { message: 'Messages retrieved successfully', data: resultData };
	next();
}

module.exports = {
	createChat,
	// getChat,
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
