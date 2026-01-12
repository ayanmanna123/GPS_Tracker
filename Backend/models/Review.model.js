// models/BusReview.js
import mongoose from "mongoose";

const busReviewSchema = new mongoose.Schema(
  {
    busId: {
      type: String,
      required: true,
      ref: "Bus",
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    ratings: {
      punctuality: { type: Number, min: 1, max: 5, required: true },
      comfort: { type: Number, min: 1, max: 5, required: true },
      cleanliness: { type: Number, min: 1, max: 5, required: true },
      driverBehavior: { type: Number, min: 1, max: 5, required: true },
      safety: { type: Number, min: 1, max: 5, required: true },
      valueForMoney: { type: Number, min: 1, max: 5, required: true },
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const Review = mongoose.model("BusReview", busReviewSchema);
export default Review;
