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
  Seats: {
    type: String,
    required: [true],
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
    type:Boolean,
    default:false

  },
  updated: { type: Date, default: moment(Date.now()).format("DD MMM YYYY") },
  created: { type: Date, default: moment(Date.now()).format("DD MMM YYYY") },
});

const car = mongoose.model("car", carSchema);
module.exports = car;
