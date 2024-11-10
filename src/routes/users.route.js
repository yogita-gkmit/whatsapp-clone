const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');

const {
	myProfile,
	specificProfile,
} = require('../controllers/users.controller');

router.get('/me', authMiddleware, myProfile);
router.get('/:id', specificProfile);

module.exports = router;
