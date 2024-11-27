const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

const { validate } = require('../middlewares/validators.middleware');
const userValidator = require('../validators/users.validator');
const usersSerializer = require('../serializers/users.serializer');
const usersController = require('../controllers/users.controller');
const responseHandler = require('../middlewares/responseHandler.middleware');

router.get(
	'/',
	authMiddleware,
	usersController.users,
	usersSerializer.users,
	responseHandler.userDisplayResponse,
);
router.get(
	'/me',
	authMiddleware,
	usersController.myProfile,
	usersSerializer.myProfile,
	responseHandler.userResponse,
);
router.get(
	'/:id',
	authMiddleware,
	usersController.specificProfile,
	usersSerializer.myProfile,
	responseHandler.userResponse,
);

router.put(
	'/:id',
	authMiddleware,
	upload.single('image'),
	validate(userValidator.editProfileSchema),
	usersController.editMyProfile,
	usersSerializer.editProfile,
	responseHandler.userResponse,
);

// TO INBOX:
router.get(
	'/:id/chats',
	authMiddleware,
	validate(userValidator.idParamSchema, true),
	validate(userValidator.queryPageSchema, false, true),
	usersController.inbox,
	usersSerializer.inbox,
	responseHandler.userDisplayResponse,
);

module.exports = router;
