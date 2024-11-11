const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const { createChat } = require('../controllers/chats.controller');

router.post('/', authMiddleware, upload.single('image'), createChat);

module.exports = router;
