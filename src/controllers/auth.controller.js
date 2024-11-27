const authServices = require('../services/auth.service');

async function register(req, res) {
	try {
		const payload = req.body;
		const image = req.file?.path;
		await authServices.create(payload, image);
		res.status(200).json({ message: `User has been successfully created` });
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function sendOtp(req, res) {
	try {
		const payload = req.body;
		const response = await authServices.sendOtp(payload);
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

async function verifyOtp(req, res) {
	try {
		const payload = req.body;
		const token = await authServices.verifyOtp(payload);
		res.status(200).json({ token: token });
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

async function logout(req, res) {
	try {
		const token = req.headers['authorization'];
		const result = await authServices.remove(token);
		res.status(200).json({
			message: result.message || 'Successfully logged out',
		});
	} catch (error) {
		console.log(error);
		const statusCode = error.statusCode || 400;
		res.status(statusCode).json({ message: error.message });
	}
}

module.exports = { register, sendOtp, verifyOtp, logout };
