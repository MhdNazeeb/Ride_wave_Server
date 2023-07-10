const express = require('express');
const router = express.Router();
const {login,getUsers,blockUser,getDrivers,getDriver,blockDriver,carList,getCar,blockDrivers,verifyCar,tripDetails} = require('../controller/admin/admin');
const { verifyTokenAdmin } = require('../middlewares/auth');
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
router.get('/trip_find',verifyTokenAdmin,tripDetails)

module.exports = router;
