const express = require('express');
const router = express.Router();
require('express-ws')(router);

const chatController = require('../../controller/v1/chatController');

router.ws('/chats/public', chatController.publicChat);

module.exports = router;