var express = require('express');
var router = express.Router();
const {login,getUsers,blockUser,getDriver} = require('../controller/admin/admin')
/* GET users listing. */
router.post('/login',login);
router.get('/users',getUsers)
router.patch('/block',blockUser)
router.patch('/driver',getDriver)

module.exports = router;
