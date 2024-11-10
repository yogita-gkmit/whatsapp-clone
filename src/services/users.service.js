const User = require('../models').User;

async function profile(id) {
	const user = await User.findOne({ where: { id: id } });
	if (!user) throw new Error('User Not Found');

	return {
		user: {
			id: user.id,
			name: user.name,
			image: user.image,
			email: user.email,
			about: user.image,
			created_at: user.created_at,
			updated_at: user.updated_at,
		},
	};
}

module.exports = { profile };
