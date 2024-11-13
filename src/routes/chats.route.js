const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

const chatsController = require('../controllers/chats.controller');

router.post(
	'/',
	authMiddleware,
	upload.single('image'),
	chatsController.createChat,
);
router.get('/:chatId', authMiddleware, chatsController.getChat);
router.put(
	'/:chatId',
	authMiddleware,
	upload.single('image'),
	chatsController.editChat,
);
router.delete('/:chatId', authMiddleware, chatsController.deleteChat);
router.put('/:chatId/users', authMiddleware, chatsController.editAdmin);

router.post(
	'/:chatId/emailInvite',
	authMiddleware,
	chatsController.emailInvite,
);

router.post('/:chatId/usersChats', authMiddleware, chatsController.addUser);

router.delete(
	'/:chatId/users/:userId',
	authMiddleware,
	chatsController.removeUser,
);

router.post(
	'/:chatId/messages',
	authMiddleware,
	upload.single('media'),
	chatsController.createMessage,
);

router.put(
	'/:chatId/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	chatsController.editMessage,
);

router.delete(
	'/:chatId/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	chatsController.deleteMessage,
);

module.exports = router;
