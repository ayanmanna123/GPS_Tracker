import mongoose from "mongoose";

const DriverDetails = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
  },
  licenceId: {
    type: String,
    required: true,
    unique: true,
  },
  driverExp: {
    type: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "driver",
  },
});

DriverDetails.methods.isActive = function() {
  return this.status === 'active';
};

const Driver = mongoose.model("Driver", DriverDetails);
export default Driver;
