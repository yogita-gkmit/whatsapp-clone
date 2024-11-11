const User = require('../models').User;

async function profile(id) {
	const user = await User.findByPk(id);
	if (!user) throw new Error('User Not Found');

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

	if (!user) throw new Error('user does not exist');

	user.name = name || user.name;
	user.image = image || user.image;
	user.about = about || user.about;
	user.email = email || user.email;

	await user.save();
}

module.exports = { profile, editProfile };
