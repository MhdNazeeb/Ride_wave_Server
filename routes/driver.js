const express = require('express');
const router = express.Router();
const {signup,login, carRegister}=require('../controller/driver/driver')
/* GET driver listing. */

 router.post('/signup',signup)
 router.post('/login',login)
 router.post('/car',carRegister)
module.exports = router;
