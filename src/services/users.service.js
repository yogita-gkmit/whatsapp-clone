const User = require('../models').User;
const { Op } = require('sequelize');
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
	const { name, email, about } = payload;
	const user = await User.findByPk(id);

	if (!user) commonHelpers.customError('user does not exist', 404);

	user.name = name;
	user.image = image;
	user.about = about;
	user.email = email;

	await user.save();
}

async function users(id) {
	const allUsers = await User.findAll({ where: { id: { [Op.not]: id } } });

	return allUsers;
}

module.exports = { profile, editProfile, users };
