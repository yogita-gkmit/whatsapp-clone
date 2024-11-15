const { User, UserChat, Message } = require('../models');

const { Op } = require('sequelize');
const { sequelize } = require('../models');
const commonHelpers = require('../helpers/common.helper');

async function profile(id) {
	const user = await User.findByPk(id);
	if (!user) commonHelpers.customError('User Not Found', 404);

	return {
		user: {
			id: user.id,
			name: user.name,
			image: user.image,
			email: user.email,
			about: user.about,
			created_at: user.created_at,
			updated_at: user.updated_at,
		},
	};
}

async function editProfile(id, image, payload) {
	const transaction = await sequelize.transaction();

	try {
		const { name, email, about } = payload;
		const user = await User.findByPk(id);

		if (!user) commonHelpers.customError('user does not exist', 404);

		const response = await User.update(
			{ image: image, name: name, email: email, about: about },
			{
				where: { id: id },
				returning: true,
			},
			{ transaction },
		);
		await transaction.commit();
		return response;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

async function users(id, page = 0) {
	const user = await User.findByPk(id);
	if (!user) commonHelpers.customError('user does not exist', 404);

	const limit = 10;
	const offset = limit * page;

	const allUsers = await User.findAll({
		where: { id: { [Op.not]: id } },
		offset: offset,
		limit: limit,
	});

	return allUsers;
}

async function inbox(id, loggedInId) {
	const user = await User.findByPk(id);
	if (!user) commonHelpers.customError('user does not exist', 404);
	if (id !== loggedInId) {
		commonHelpers.customError('Invalid user', 400);
	}

	// const userChat = await UserChat.findAll({ where: { user_id: id } });
	// const chatIds = userChat.map(item => item.chat_id);

	// const lastMessage = await Message.findAll({
	// 	where: { chat_id: { [Op.in]: chatIds } },
	// 	order: [['created_at', 'DESC']],
	// 	// limit: 1,
	// });

	// console.log(lastMessage);
	const [results, metadata] = await sequelize.query(
		`SELECT
	    c.id AS chat_id,
	    c.name AS chat_name,
	    c.description,
	    c.image AS chat_image,
	    c.type,
	    lm.message AS last_message,
	    lm.media AS last_media,
	    lm.created_at AS last_message_created_at
	FROM
	    users_chats uc
	INNER JOIN
	    chats c ON uc.chat_id = c.id
	LEFT JOIN (
	    SELECT
	        m1.chat_id,
	        m1.message,
	        m1.media,
	        m1.created_at
	    FROM
	        messages m1
	    INNER JOIN (
	        SELECT
	            chat_id,
	            MAX(created_at) AS latest_message_time
	        FROM
	            messages
	        GROUP BY
	            chat_id
	    ) m2 ON m1.chat_id = m2.chat_id AND m1.created_at = m2.latest_message_time
	) lm ON c.id = lm.chat_id
	WHERE
	    uc.user_id = :id
	GROUP BY
	    c.id, uc.user_id, lm.message, lm.media, lm.created_at;`,
		{
			replacements: { id },
		},
	);

	return { results };
}

module.exports = { profile, editProfile, users, inbox };
