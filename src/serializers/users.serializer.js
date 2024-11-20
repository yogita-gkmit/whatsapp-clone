async function users(req, res, next) {
	const receivedData = res.data || [];
	const resultData = receivedData.map(user => ({
		id: user.id,
		name: user.name,
		about: user.about,
		image: user.image,
	}));
	res.data = resultData;
	next();
}

async function myProfile(req, res, next) {
	const receivedData = res.data || {};

	let resultData = {};

	if (receivedData) {
		resultData = {
			id: receivedData.user.id,
			name: receivedData.user.name,
			email: receivedData.user.email,
			image: receivedData.user.image,
			about: receivedData.user.about,
		};
	}
	res.data = resultData;
	next();
}

async function editProfile(req, res, next) {
	const receivedData = res.data || [];

	let resultData = {};

	if (receivedData && receivedData[1] && receivedData[1][0]) {
		const user = receivedData[1][0];

		resultData = {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			about: user.about,
		};
	}

	res.data = resultData;
	next();
}

async function inbox(req, res, next) {
	const receivedData = res.data || [];

	const resultData = receivedData.results.map(userChat => {
		if (userChat.type === 'group') {
			return {
				chatId: userChat.chat_id,
				chatName: userChat.chat_name,
				description: userChat.description,
				chatImage: userChat.chat_image,
				type: userChat.type,
				lastMessage: userChat.last_message,
				lastMedia: userChat.last_media,
			};
		} else {
			return {
				chatId: userChat.chat_id,
				type: userChat.type,
				lastMessage: userChat.last_message,
				lastMedia: userChat.last_media,
				userName: userChat.user_name,
				userImage: userChat.user_image,
				userAbout: userChat.user_about,
			};
		}
	});
	res.data = resultData;
	next();
}

module.exports = { users, myProfile, editProfile, inbox };
