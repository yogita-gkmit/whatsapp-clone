const usersService = require('../services/users.service');

async function users(req, res, next) {
	try {
		const id = req.user.id;
		const { page } = req.query;
		const response = await usersService.users(id, page);
		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function myProfile(req, res, next) {
	try {
		const id = req.user.id;
		const response = await usersService.profile(id);
		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function specificProfile(req, res, next) {
	try {
		const { id } = req.params;
		const response = await usersService.profile(id);
		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function editMyProfile(req, res, next) {
	try {
		const loggedInid = req.user.id;
		const { id } = req.params;
		const image = req.file?.path;
		const payload = req.body;
		const response = await usersService.editProfile(
			loggedInid,
			id,
			image,
			payload,
		);
		res.statusCode = 200;
		res.data = response;
		next();
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function inbox(req, res, next) {
	try {
		const { id } = req.params;
		const { page } = req.query;
		const loggedInId = req.user.id;
		const response = await usersService.inbox(id, loggedInId, page);
		res.statusCode = 200;
		res.data = response;
		next();
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
	users,
	inbox,
};
