const mongoose = require("mongoose");
const moment = require("moment");

const carSchema = new mongoose.Schema({
  model: {
    type: String,
    required: [true],
  },
  year: {
    type: String,
    required: [true],
  },
  RegistrationNumber: {
    type: String,
    required: [true],
    unique: true,
  },
  Features: {
    type: String,
    required: [true],
  },
  Rate: {
    type:String,
    required: [true],
  },
  carimage: {
    type: String,
    required: [true],
   
  },
  carVerify:{
    type:String,
    default:'not verified'

  },
  RideStatus:{
    type:String,
    default:'not booked'
  },
  LocationStatus:{
    type:String,
    default:'of'
  },
  userId:{
   type: mongoose.Schema.Types.ObjectId,
   ref:'user'
   
  },
  location:{
    type:Array,

  },
  
  updated: { type: Date, default: moment(Date.now()).format("DD MMM YYYY") },
  created: { type: Date, default: moment(Date.now()).format("DD MMM YYYY") },
});

const car = mongoose.model("car", carSchema);
module.exports = car;
