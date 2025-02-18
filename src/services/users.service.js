const { User, sequelize } = require('../models');
const { Op } = require('sequelize');
const commonHelpers = require('../helpers/common.helper');

// to display user's profile
async function profile(id) {
	const user = await User.findByPk(id);
	if (!user) {
		throw commonHelpers.customError('User Not Found', 404);
	}
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

// to edit loggedIn user's profile
async function editProfile(loggedInid, id, image, payload) {
	const { name, email, about } = payload;
	if (loggedInid !== id) {
		throw commonHelpers.customError(
			'user is not allowed to edit other user',
			403,
		);
	}
	const user = await User.findByPk(id);

	if (!user) {
		throw commonHelpers.customError('user does not exist', 404);
	}

	const response = await User.update(
		{ image: image, name: name, email: email, about: about },
		{
			where: { id: id },
			returning: true,
		},
	);

	return response;
}

// to display contacts
async function users(id, page = 0) {
	const user = await User.findByPk(id);
	if (!user) {
		throw commonHelpers.customError('user does not exist', 404);
	}

	const limit = 10;
	const offset = limit * page;

	const allUsers = await User.findAndCountAll({
		where: { id: { [Op.not]: id } },
		attributes: { exclude: ['email'] },
		offset: offset,
		limit: limit,
	});

	return {
		allUsers: allUsers.rows,
		totalItems: allUsers.count,
		totalPages: Math.ceil(allUsers.count / limit),
		currentPage: parseInt(page),
	};
}

// to show inbox
async function inbox(id, loggedInId, page = 0) {
	const user = await User.findByPk(id);
	if (!user) {
		throw commonHelpers.customError('user does not exist', 404);
	}
	if (id !== loggedInId) {
		throw commonHelpers.customError('Invalid user', 400);
	}
	const limit = 10;
	const offset = limit * page;

	const [results, metadata] = await sequelize.query(
		`
		SELECT
		c.id AS chat_id,
		c.name AS chat_name,
		c.description,
		c.image AS chat_image,
		c.type,
		lm.message AS last_message,
		lm.media AS last_media,
		lm.created_at AS last_message_created_at,
		CASE
    		WHEN c.type = 'one-to-one'
    		THEN (SELECT u.name FROM users u WHERE u.id = uc.user_id)
    		ELSE NULL
		END AS user_name,

		CASE
    		WHEN c.type = 'one-to-one'
    		THEN (SELECT u.image FROM users u WHERE u.id = uc.user_id)
    		ELSE NULL
		END AS user_image,

		CASE
    		WHEN c.type = 'one-to-one'
    		THEN (SELECT u.about FROM users u WHERE u.id = uc.user_id)
    		ELSE NULL
		END AS user_about

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
		c.id, uc.user_id, lm.message, lm.media, lm.created_at
		ORDER BY
		last_message_created_at DESC
		OFFSET :offset
		LIMIT :limit;
`,
		{
			replacements: { id, offset, limit },
		},
	);

	return {
		results: results,
		totalItems: results.length,
		totalPages: Math.ceil(results.length / limit),
		currentPage: parseInt(page),
	};
}

module.exports = { profile, editProfile, users, inbox };
