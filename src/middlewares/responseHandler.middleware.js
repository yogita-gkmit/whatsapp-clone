async function response(req, res) {
	const status = res.statusCode || 200;
	const data = res.data.data;
	const message = res.data.message;

	res.status(status).json({ message, data });
}

async function userResponse(req, res) {
	const status = res.statusCode || 200;
	const data = res.data;
	const message = res.message;

	res.status(status).json({ message, data });
}
module.exports = { response, userResponse };
