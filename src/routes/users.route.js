const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

const { validate } = require('../middlewares/validators.middleware');
const userValidator = require('../validators/users.validator');

const usersController = require('../controllers/users.controller');

router.get('/', authMiddleware, usersController.users);
router.get('/me', authMiddleware, usersController.myProfile);
router.get('/:id', usersController.specificProfile);

router.put(
	'/me',
	authMiddleware,
	upload.single('image'),
	validate(userValidator.editProfileSchema),
	usersController.editMyProfile,
);
router.put(
	'/:id',
	validate(userValidator.editProfileSchema),
	upload.single('image'),
	usersController.editSpecificProfile,
);

// TO INBOX:
router.get(
	'/:id/chats',
	authMiddleware,
	validate(userValidator.idParamSchema, true),
	validate(userValidator.queryPageSchema, false, true),
	usersController.inbox,
);

module.exports = router;
