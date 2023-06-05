var express = require('express');
var router = express.Router();
const {login}=require('../controller/admin/admin')
/* GET users listing. */
router.post('/login',login);

module.exports = router;
