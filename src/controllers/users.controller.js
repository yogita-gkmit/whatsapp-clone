const usersService = require('../services/users.service');

async function users(req, res) {
	try {
		const id = req.user.id;
		const { page } = req.query;
		const response = await usersService.users(id, page);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function myProfile(req, res) {
	try {
		const id = req.user.id;
		const response = await usersService.profile(id);

		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function specificProfile(req, res) {
	try {
		const { id } = req.params;
		const response = await usersService.profile(id);

		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editMyProfile(req, res) {
	try {
		const id = req.user.id;

		const image = req.file?.path;
		const payload = req.body;
		const response = await usersService.editProfile(id, image, payload);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editSpecificProfile(req, res) {
	try {
		const { id } = req.params;

		const image = req.file?.path;
		const payload = req.body;

		const response = await usersService.editProfile(id, image, payload);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function inbox(req, res) {
	try {
		const { id } = req.params;
		const { page } = req.query;
		const loggedInId = req.user.id;

		const response = await usersService.inbox(id, loggedInId, page);
		res.status(200).json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

module.exports = {
	myProfile,
	specificProfile,
	editMyProfile,
	editSpecificProfile,
	users,
	inbox,
};
