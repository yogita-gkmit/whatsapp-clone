const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

const { validate } = require('../middlewares/validators.middleware');
const { editProfileSchema } = require('../validators/users.validator');

const usersController = require('../controllers/users.controller');

router.get('/', authMiddleware, usersController.users);
router.get('/me', authMiddleware, usersController.myProfile);
router.get('/:id', usersController.specificProfile);

router.put(
	'/me',
	authMiddleware,
	validate(editProfileSchema),
	upload.single('image'),
	usersController.editMyProfile,
);
router.put(
	'/:id',
	validate(editProfileSchema),
	upload.single('image'),
	usersController.editSpecificProfile,
);

module.exports = router;
