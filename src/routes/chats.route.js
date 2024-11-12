const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const {
	createChat,
	getChat,
	editChat,
	deleteChat,
	editAdmin,
	addUser,
	emailInvite,
	removeUser,
} = require('../controllers/chats.controller');

router.post('/', authMiddleware, upload.single('image'), createChat);
router.get('/:chatId', authMiddleware, getChat);
router.put('/:chatId', authMiddleware, upload.single('image'), editChat);
router.delete('/:chatId', authMiddleware, deleteChat);
router.put('/:chatId/users', authMiddleware, editAdmin);

router.post('/:chatId/emailInvite', authMiddleware, emailInvite);

router.post('/:chatId/usersChats', authMiddleware, addUser);

router.delete('/:chatId/users/:userId', authMiddleware, removeUser);

module.exports = router;
