const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const chatsSerializer = require('../serializers/chats.serializer');
const { validate } = require('../middlewares/validators.middleware');
const chatValidator = require('../validators/chats.validator');
const responseHandler = require('../middlewares/responseHandler.middleware');
const chatsController = require('../controllers/chats.controller');

router.post(
	'/',
	authMiddleware,
	upload.single('image'),
	validate(chatValidator.createChatBodySchema),
	chatsController.createChat,
	chatsSerializer.createChat,
	responseHandler.response,
);

router.get(
	'/:chatId',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.getChat,
	chatsSerializer.getChat,
	responseHandler.response,
);

router.put(
	'/:chatId',
	authMiddleware,
	upload.single('image'),
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.editChatBodySchema),
	chatsController.editChat,
	chatsSerializer.editChat,
	responseHandler.response,
);

router.delete(
	'/:chatId',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.deleteChat,
	chatsSerializer.deleteChat,
	responseHandler.response,
);

router.put(
	'/:chatId/users',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.editRoleSchema),
	chatsController.editAdmin,
	chatsSerializer.editAdmin,
	responseHandler.response,
);

router.post(
	'/:chatId/emailInvite',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.emailInviteBodySchema),
	chatsController.emailInvite,
	chatsSerializer.emailInvite,
	responseHandler.response,
);

router.post(
	'/:chatId/usersChats',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.addUserBodySchema),
	chatsController.addUser,
	chatsSerializer.addUser,
	responseHandler.response,
);

router.delete(
	'/:chatId/users/:userId',
	authMiddleware,
	validate(chatValidator.userIdParamSchema, true),
	chatsController.removeUser,
	chatsSerializer.removeUser,
	responseHandler.response,
);

router.post(
	'/:chatId/messages',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.createMessageBodySchema),
	chatsController.createMessage,
	chatsSerializer.createMessage,
	responseHandler.response,
);

router.put(
	'/:chatId/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.messageIdParamSchema, true),
	validate(chatValidator.editMessageBodySchema),
	chatsController.editMessage,
	chatsSerializer.editMessage,
	responseHandler.response,
);

router.delete(
	'/:chatId/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.messageIdParamSchema, true),
	chatsController.deleteMessage,
	chatsSerializer.deleteMessage,
	responseHandler.response,
);

router.get(
	'/:chatId/messages',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.displayMessages,
	chatsSerializer.displayMessages,
	responseHandler.response,
);
module.exports = router;
