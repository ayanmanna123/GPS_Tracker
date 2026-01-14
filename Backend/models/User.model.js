import mongoose from "mongoose";

const UserDetails = new mongoose.Schema({
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
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "user",
  },
});

UserDetails.methods.isAdmin = function() {
  return this.status === 'admin';
};

const User = mongoose.model("User", UserDetails);
export default User;
