const { isTokenBlacklisted } = require('../helpers/redis.helper');
const { verifyToken } = require('../helpers/auth.helper');

async function authMiddleware(req, res, next) {
	const token = req.headers['authorization'];
	if (!token) {
		throw new Error('Token is required');
	}
	try {
		const isBlacklisted = await isTokenBlacklisted(token);
		if (isBlacklisted) {
			throw new Error('Token is blacklisted');
		}
		const decoded = await verifyToken(token);
		req.user = decoded;
		next();
	} catch (error) {
		console.log(error);
		throw new Error('Unauthorized');
	}
}

module.exports = { authMiddleware };
