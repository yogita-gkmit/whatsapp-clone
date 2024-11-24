async function response(req, res) {
	const status = res.statusCode || 200;
	const data = res.data.data;
	const message = res.data.message;
	const page = res.data.page || {};
	res.status(status).json({ message, data, page });
}

async function userResponse(req, res) {
	const status = res.statusCode || 200;
	const data = res.data;
	const message = res.message;
	const page = res.page;

	res.status(status).json({ message, data, page });
}
module.exports = { response, userResponse };
