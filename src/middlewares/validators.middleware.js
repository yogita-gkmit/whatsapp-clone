function validate(schema, params = false, query = false) {
	return (req, res, next) => {
		let result;

		if (params) {
			result = schema.validate(req.params);
		} else if (query) {
			result = schema.validate(req.query);
		} else {
			result = schema.validate(req.body);
		}

		const { error } = result;

		if (error) {
			return res.status(400).json({
				errors: error.details.map(detail => ({
					message: detail.message,
					path: detail.path,
				})),
			});
		}
		next();
	};
}

module.exports = { validate };
