const User = require('../models').User;
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

async function editProfile(id, name, image, about, email) {
	const user = await User.findByPk(id);

	console.log(id, name, image, about, email);
	if (!user) commonHelpers.customError('user does not exist', 404);

	user.name = name || user.name;
	user.image = image || user.image;
	user.about = about || user.about;
	user.email = email || user.email;

	await user.save();
}

module.exports = { profile, editProfile };
