async function response(req, res) {
	const status = res.statusCode || 200;
	const data = res.data.data;
	const message = res?.data?.message;
	const pagination = res?.data?.page;
	res.status(status).json({ message, data, pagination });
}

async function userResponse(req, res) {
	const status = res.statusCode || 200;
	const data = res?.data;
	const message = res?.message;
	const pagination = res?.page;

	res.status(status).json({ message, data, pagination });
}
module.exports = { response, userResponse };
