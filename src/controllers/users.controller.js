const { profile, editProfile } = require('../services/users.service');

async function myProfile(req, res) {
	try {
		const id = req.user.id;
		const response = await profile(id);

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

async function editMyProfile(req, res) {
	try {
		const id = req.user.id;

		const image = req.file?.path;
		const { name, email, about } = req.body;
		const response = await editProfile(id, name, image, about, email);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log('Error editing logged in user', error);
		res.status(400).json({ message: error.message });
	}
}

async function editSpecificProfile(req, res) {
	try {
		const { id } = req.params;

		const image = req.file?.path;
		const { name, email, about } = req.body;

		const response = await editProfile(id, name, image, about, email);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log('Error editing specific user', error);
		res.status(400).json({ message: error.message });
	}
}
module.exports = {
	myProfile,
	specificProfile,
	editMyProfile,
	editSpecificProfile,
};
