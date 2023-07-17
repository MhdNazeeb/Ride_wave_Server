const express = require('express')
const router = express.Router()

const {CreateChat,userChats,findChat,findUser } = require('../controller/message/chat')

router.get('/user/:userId',findUser)

router.post('/',CreateChat)

router.get('/:userId',userChats)

router.get('/find/:firstId/:secondId',findChat)


module.exports = router;