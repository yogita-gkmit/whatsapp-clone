const { profile } = require('../services/users.service');

async function myProfile(req, res) {
	try {
		const id = req.user.id;
		const response = await profile(id);
		console.log(id);

		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log('Error showing logged in user', error);
		res.status(400).json({ message: error.message });
	}
}

async function specificProfile(req, res) {
	try {
		const { id } = req.params;
		console.log(id);
		const response = await profile(id);

		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log('Error showing specific user', error);
		res.status(400).json({ message: error.message });
	}
}

module.exports = { myProfile, specificProfile };
