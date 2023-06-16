var express = require('express');
var router = express.Router();
const {signup,login,verifyLink,carList}=require('../controller/user/user');



/* GET home page. */
router.post('/signup',signup)
router.post('/login',login)
router.get('/verify',verifyLink)
router.get('/carlist',carList)




module.exports = router;
