import mongoose from "mongoose";

const BusDetails = mongoose.Schema({
  deviceID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  to: {
    type: String,
  },
  from: {
    type: String,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  ratings: {
    punctuality: { type: Number, min: 1, max: 5, required: true, default: 1 },
    comfort: { type: Number, min: 1, max: 5, required: true, default: 1 },
    cleanliness: { type: Number, min: 1, max: 5, required: true, default: 1 },
    driverBehavior: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      default: 1,
    },
    safety: { type: Number, min: 1, max: 5, required: true, default: 1 },
    valueForMoney: { type: Number, min: 1, max: 5, required: true, default: 1 },
  },
  ticketprice: {
    type: Number,
    min: 1,
  },
  timeSlots: [
    {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
  ],
  capacity: {
    totalSeats: {
      type: Number,
      default: 40,
      required: true,
    },
    occupiedSeats: {
      type: Number,
      default: 0,
    },
    availableSeats: {
      type: Number,
      default: 40,
    },
  },
  tracking: {
    currentSpeed: {
      type: Number,
      default: 0, // km/h
    },
    direction: {
      type: Number,
      default: 0, // degrees 0-360
    },
    lastSpeedUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  trafficCondition: {
    type: String,
    enum: ["light", "moderate", "heavy", "severe", "unknown"],
    default: "unknown",
  },
  estimatedArrival: {
    type: Date,
  },
  sharedWith: [
    {
      userId: { type: String },
      sharedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date },
    },
  ],
});

const Bus = mongoose.model("Bus", BusDetails);
export default Bus;
