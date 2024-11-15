const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

const { validate } = require('../middlewares/validators.middleware');
const chatValidator = require('../validators/chats.validator');

const chatsController = require('../controllers/chats.controller');

router.post(
	'/',
	authMiddleware,
	upload.single('image'),
	validate(chatValidator.createChatBodySchema),
	chatsController.createChat,
);

router.get(
	'/:chatId',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.getChat,
);

router.put(
	'/:chatId',
	authMiddleware,
	upload.single('image'),
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.editChatBodySchema),
	chatsController.editChat,
);

router.delete(
	'/:chatId',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.deleteChat,
);

router.put(
	'/:chatId/users',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.editRoleSchema),
	chatsController.editAdmin,
);

router.post(
	'/:chatId/emailInvite',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.emailInviteBodySchema),
	chatsController.emailInvite,
);

router.post(
	'/:chatId/usersChats',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.addUserBodySchema),
	chatsController.addUser,
);

router.delete(
	'/:chatId/users/:userId',
	authMiddleware,
	validate(chatValidator.userIdParamSchema, true),
	chatsController.removeUser,
);

router.post(
	'/:chatId/messages',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.createMessageBodySchema),
	chatsController.createMessage,
);

router.put(
	'/:chatId/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.messageIdParamSchema, true),
	validate(chatValidator.editMessageBodySchema),
	chatsController.editMessage,
);

router.delete(
	'/:chatId/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.messageIdParamSchema, true),
	chatsController.deleteMessage,
);

router.get(
	'/:chatId/messages',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.displayMessages,
);
module.exports = router;
