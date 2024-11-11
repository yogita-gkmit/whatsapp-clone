function validate(schema, params = false) {
	return (req, res, next) => {
		const { error } = params
			? schema.validate(req.params)
			: schema.validate(req.body);

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
