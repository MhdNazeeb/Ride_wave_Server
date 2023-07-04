const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
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
    Reachedpickup: { type: String, default: "Pending", required: true },
    StartedToDestination: { type: String, default: "Pending", required: true },
    ReachedDestination: { type: String, default: "Pending", required: true },
    verficationCode: { type: Number, default: 0, required: true },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    payment: {
      amount: { type: Number, default: 0, required: true },
      aduvance: { type: Number, default: 0, required: true },
      status: { type: Boolean, default: false, required: true },
      refund: { type: Boolean, default: false },
    },
  },

  { timestamps: true }
);

const tripModel = mongoose.model("Trip", tripSchema);

module.exports = tripModel;
