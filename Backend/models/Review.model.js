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
    userName: {
      type: String,
      required: false,
    },
    userEmail: {
      type: String,
      required: false,
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
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "Maximum 5 photos allowed per review",
      },
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reports: [
      {
        userId: { type: String, required: true },
        reason: {
          type: String,
          enum: [
            "spam",
            "inappropriate",
            "offensive",
            "fake",
            "harassment",
            "other",
          ],
          required: true,
        },
        description: { type: String, maxlength: 300 },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: {
      type: [String],
      default: [],
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
