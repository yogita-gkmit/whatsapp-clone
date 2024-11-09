const { reddis } = require('../config/redis');
async function addTokenToBlacklist(token, expiresIn) {
	try {
		await reddis.set(token, 'blacklisted', 'EX', expiresIn);
		return 'Token added to blacklist';
	} catch (err) {
		console.error('Error adding token to blacklist', err);
		throw err;
	}
}
async function isTokenBlacklisted(token) {
	try {
		const result = await reddis.get(token);
		return result === 'blacklisted';
	} catch (err) {
		console.error('Error checking if token is blacklisted', err);
		throw err;
	}
}

module.exports = { isTokenBlacklisted, addTokenToBlacklist };
