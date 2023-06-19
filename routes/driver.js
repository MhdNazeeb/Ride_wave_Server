const express = require('express');
const router = express.Router();
 const {signup,login, carRegister,profile,getProfile,getCar,editCar}=require('../controller/driver/driver')
 const {verifyTokenDriver}= require('../middlewares/auth')
/* GET driver listing. */

 router.post('/signup',signup)
 router.post('/login',login)
 router.post('/car',verifyTokenDriver,carRegister)
 router.patch('/profile',verifyTokenDriver,profile)
 router.get('/profile',verifyTokenDriver,getProfile)
 router.get('/car',verifyTokenDriver,getCar)
 router.patch('/car',verifyTokenDriver,editCar)


module.exports = router;
