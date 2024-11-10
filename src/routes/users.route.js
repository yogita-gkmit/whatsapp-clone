const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');

const { myProfile } = require('../controllers/users.controller');

router.get('/me', authMiddleware, myProfile);

module.exports = router;
