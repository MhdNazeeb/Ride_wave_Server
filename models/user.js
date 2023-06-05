
const mongoose =  require('mongoose')
const moment = require("moment");

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true],
        
      },
    email: {
      type: String,
      required: [true],
      unique: true,
    },
    password: {
      type: String,
      required: [true],
      
    },
    confirm_password: {
      type: String,
      required: [true],
      
    },
    status: {
      type: Boolean,
      default:true
    },
   license:{
    type:String
   },
  isverify:{
    type: Boolean,
    default:false
  },
  EmailToken:{
    type: String,
    
  },
  isAdmin:{
    type:Boolean,
    default:false
  },
  isDriver:{
    type:Boolean,
    default:false,
  },
updated:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY")},
created:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY")}
})

const user = mongoose.model("user",addressSchema)
module.exports = user