const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const {
	myProfile,
	specificProfile,
	editMyProfile,
	editSpecificProfile,
} = require('../controllers/users.controller');

router.get('/me', authMiddleware, myProfile);
router.get('/:id', specificProfile);

router.put('/me', authMiddleware, upload.single('image'), editMyProfile);
router.put('/:id', upload.single('image'), editSpecificProfile);

module.exports = router;
