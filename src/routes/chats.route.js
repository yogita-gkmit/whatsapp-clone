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
	'/:id',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.getChat,
	chatsSerializer.getChat,
	responseHandler.response,
);

router.put(
	'/:id',
	authMiddleware,
	upload.single('image'),
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.editChatBodySchema),
	chatsController.editChat,
	chatsSerializer.editChat,
	responseHandler.response,
);

router.delete(
	'/:id',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.deleteChat,
	chatsSerializer.deleteChat,
	responseHandler.response,
);

router.put(
	'/:id/users',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.editRoleSchema),
	chatsController.editAdmin,
	chatsSerializer.editAdmin,
	responseHandler.response,
);

router.post(
	'/:id/emailInvite',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.emailInviteBodySchema),
	chatsController.emailInvite,
	chatsSerializer.emailInvite,
	responseHandler.response,
);

router.get(
	'/:id/usersChats',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.addUserBodySchema, false, true),
	chatsController.addUser,
	chatsSerializer.addUser,
	responseHandler.response,
);

router.delete(
	'/:id/users/:userId',
	authMiddleware,
	validate(chatValidator.userIdParamSchema, true),
	chatsController.removeUser,
	chatsSerializer.removeUser,
	responseHandler.response,
);

router.post(
	'/:id/messages',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.chatIdParamSchema, true),
	validate(chatValidator.createMessageBodySchema),
	chatsController.createMessage,
	chatsSerializer.createMessage,
	responseHandler.response,
);

router.put(
	'/:id/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.messageIdParamSchema, true),
	validate(chatValidator.editMessageBodySchema),
	chatsController.editMessage,
	chatsSerializer.editMessage,
	responseHandler.response,
);

router.delete(
	'/:id/messages/:messageId',
	authMiddleware,
	upload.single('media'),
	validate(chatValidator.messageIdParamSchema, true),
	chatsController.deleteMessage,
	chatsSerializer.deleteMessage,
	responseHandler.response,
);

router.get(
	'/:id/messages',
	authMiddleware,
	validate(chatValidator.chatIdParamSchema, true),
	chatsController.displayMessages,
	chatsSerializer.displayMessages,
	responseHandler.response,
);
module.exports = router;
