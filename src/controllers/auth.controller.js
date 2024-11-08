const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { create } = require('./services/auth.service');
const { validUser } = require('./validators/auth.validator');

async function register(req, res) {
	const { name, image, about, email } = req.body;

	if (await validUser(email)) {
		res.status(401).json({ message: 'User already exists' });
	}

	await create(name, image, about, email);
	res.status(200).json({ message: 'User created successfully' });
}

module.exports = { register };
