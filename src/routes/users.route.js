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
	responseHandler.response,
);
router.get(
	'/me',
	authMiddleware,
	usersController.myProfile,
	usersSerializer.myProfile,
	responseHandler.response,
);
router.get(
	'/:id',
	authMiddleware,
	usersController.specificProfile,
	usersSerializer.myProfile,
	responseHandler.response,
);

router.put(
	'/me',
	authMiddleware,
	upload.single('image'),
	validate(userValidator.editProfileSchema),
	usersController.editMyProfile,
	usersSerializer.editProfile,
	responseHandler.response,
);

// TO INBOX:
router.get(
	'/:id/chats',
	authMiddleware,
	validate(userValidator.idParamSchema, true),
	validate(userValidator.queryPageSchema, false, true),
	usersController.inbox,
	usersSerializer.inbox,
	responseHandler.response,
);

module.exports = router;
