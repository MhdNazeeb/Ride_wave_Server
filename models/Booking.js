const mongoose = require("mongoose")

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
    },
    time: {
      type: String,
      required: true,
    },
    emergency: {
      type: String,
    },
    location: {
      pickup: { type: String, required: true },
      dropoff: { type: String, required: true },
      distance: { type: Number, required: true },
    },
    bookingStatus: { type: String, default: "Pending", required: true },
    verficationCode: { type: Number, default: 0, required: true },

    passengers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        advancePayment: {
          status: {
            type: Boolean,
            default: false,
          },
          amount:{
            type:Number,
            default:0
          }
        },
        totalPayment: {
          status: {
            type: Boolean,
            default: false,
          },
          refund:{
            type:Number,
        },
        amount:{
            type:Number,
        }
        
        },
       
      },
    ],
  },

  { timestamps: true }
);

const tripModel = mongoose.model("Trip", tripSchema);

module.exports = tripModel;
