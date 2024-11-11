const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const {
	createChat,
	getChat,
	editChat,
	deleteChat,
} = require('../controllers/chats.controller');

router.post('/', authMiddleware, upload.single('image'), createChat);
router.get('/:chat_id', authMiddleware, getChat);
router.put('/:chat_id', authMiddleware, upload.single('image'), editChat);
router.delete('/:chat_id', authMiddleware, deleteChat);

module.exports = router;
