const express = require('express');
const router = express.Router();
 const {signup,login, carRegister,profile,getProfile}=require('../controller/driver/driver')
/* GET driver listing. */

 router.post('/signup',signup)
 router.post('/login',login)
 router.post('/car',carRegister)
 router.patch('/profile',profile)
 router.get('/profile',getProfile)


module.exports = router;
