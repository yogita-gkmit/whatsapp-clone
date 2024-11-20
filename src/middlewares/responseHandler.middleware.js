async function response(req, res) {
	const status = res.statusCode || 200;
	const data = res.data || {};

	res.status(status).json({ data });
}

module.exports = { response };
