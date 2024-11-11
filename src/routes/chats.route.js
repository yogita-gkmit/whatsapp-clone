const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer.middleware');
const { createChat } = require('../controllers/chats.controller');

router.post('/', upload.single('image'), createChat);

module.exports = router;
