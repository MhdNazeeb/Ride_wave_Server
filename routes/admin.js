const express = require('express');
const router = express.Router();
const {login,getUsers,blockUser,getDrivers,getDriver,blockDriver,carList,getCar,blockDrivers,verifyCar} = require('../controller/admin/admin')
/* GET users listing. */
router.post('/login',login);
router.get('/users',getUsers)
router.patch('/block',blockUser)
router.get('/drivers',getDrivers)
router.get('/driver',getDriver)
router.patch('/driver',blockDriver)
router.get('/carlist',carList)
router.get('/car',getCar)
router.patch('/drivers',blockDrivers)
router.patch('/car',verifyCar)

module.exports = router;
