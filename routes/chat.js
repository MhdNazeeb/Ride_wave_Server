const express = require('express')
const router = express.Router()

const {CreateChat,userChats,findChat }=require('../controller/message/chat')


router.post('/',CreateChat)

router.get('/:userId',userChats)

router.get('/find/:firstId/:secondId',findChat)

module.exports = router;