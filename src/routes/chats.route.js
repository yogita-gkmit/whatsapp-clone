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
} = require('../controllers/chats.controller');

router.post('/', authMiddleware, upload.single('image'), createChat);
router.get('/:chat_id', authMiddleware, getChat);
router.put('/:chat_id', authMiddleware, upload.single('image'), editChat);
router.delete('/:chat_id', authMiddleware, deleteChat);
router.put('/:chat_id/users', authMiddleware, editAdmin);

// to send email invite
router.post('/:chat_id/email-invite', authMiddleware, emailInvite);

//email invite bhejna hai isme abhi
router.post('/:chat_id/users_chats', authMiddleware, addUser);

module.exports = router;
