import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  deviceID: {
    type: String,
    required: true,
  },
  route: [
    {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      timestamp: { type: Date, default: Date.now },
      speed: { type: Number, default: 0 }, // km/h
      accuracy: { type: Number, default: 0 },
      direction: { type: Number, default: 0 }, // degrees
      passengerCount: { type: Number, default: 0 },
    },
  ],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    timestamp: { type: Date, default: Date.now },
  },
  prevlocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    timestamp: { type: Date, default: Date.now },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  realTimeData: {
    currentPassengers: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      default: 0, // km/h
    },
    direction: {
      type: Number,
      default: 0, // degrees 0-360
    },
    trafficLevel: {
      type: String,
      enum: ["light", "moderate", "heavy", "severe", "unknown"],
      default: "unknown",
    },
    eta: {
      type: Date,
    },
    lastDataUpdate: {
      type: Date,
      default: Date.now,
    },
  },
});
busSchema.index({ location: "2dsphere" });
const Location = mongoose.model("Location", busSchema);
export default Location;
