
const mongoose =  require('mongoose')
const moment = require("moment");


const Wallet = new mongoose.Schema({

  ownerId:{
   type:mongoose.Schema.Types.ObjectId,
   ref:'user'
  },
  currentBalance:{
    type:Number,
    default:0
  },
  transactions:
     [
        {
            payee:{
              type:mongoose.Schema.Types.ObjectId,
              ref:"user",
            },
            amount:{
              type:Number
            },
            recever:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            },
            Date:{
              type:String
            },
            Status:{
              type:Boolean
            }
        }
    
     ],
     
},
{ timestamps: true }
)
const wallet = mongoose.model("wallet",Wallet)
module.exports = wallet