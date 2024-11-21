const { isTokenBlacklisted } = require('../helpers/redis.helper');
const { verifyToken } = require('../helpers/auth.helper');
const commonHelpers = require('../helpers/common.helper');

async function authMiddleware(req, res, next) {
	const token = req.headers['authorization'];

	try {
		if (!token) {
			throw commonHelpers.customError('Token is required', 401);
		}

		const isBlacklisted = await isTokenBlacklisted(token);
		if (isBlacklisted) {
			throw commonHelpers.customError('Token is blacklisted', 401);
		}
		const decoded = await verifyToken(token);
		req.user = decoded;
		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({ message: 'Unauthorized' });
	}
}

module.exports = { authMiddleware };
