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

  role: {
    type: String,
    enum: ["admin", "user", "moderator"],
    default: "user",   // 👈 by default normal user
  },

  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },

  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const User = mongoose.model("User", UserDetails);
export default User;
