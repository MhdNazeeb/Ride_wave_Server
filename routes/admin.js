var express = require('express');
var router = express.Router();
const {login,getUsers,blockUser,getDrivers,getDriver,blockDriver,carList} = require('../controller/admin/admin')
/* GET users listing. */
router.post('/login',login);
router.get('/users',getUsers)
router.patch('/block',blockUser)
router.get('/drivers',getDrivers)
router.get('/driver',getDriver)
router.patch('/driver',blockDriver)
router.get('/carlist',carList)

module.exports = router;
