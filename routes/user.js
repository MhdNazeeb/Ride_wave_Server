var express = require('express');
var router = express.Router();
const {verifyTokenClient }=require('../middlewares/auth')
const {signup,login,verifyLink,carList,bookCar}=require('../controller/user/user');



/* GET home page. */
router.post('/signup',signup)
router.post('/login',login)
router.get('/verify',verifyLink)
router.get('/carlist',carList)
router.post('/book',verifyTokenClient,bookCar)




module.exports = router;
