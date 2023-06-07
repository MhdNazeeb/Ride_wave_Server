var express = require('express');
var router = express.Router();
const {signup,login,verifyLink}=require('../controller/user/user');



/* GET home page. */
router.post('/signup',signup)
router.post('/login',login)
router.get('/verify',verifyLink)




module.exports = router;
