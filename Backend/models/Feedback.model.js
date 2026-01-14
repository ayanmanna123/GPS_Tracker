import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    busId: {
      type: String,
      ref: "Bus",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    categories: [
      {
        type: String,
        enum: [
          "Delay",
          "Cleanliness",
          "Safety",
          "Driver Behavior",
          "Route Efficiency",
          "Other",
        ],
      },
    ],
    comment: {
      type: String,
      maxlength: 1000,
    },
    suggestion: {
      type: String,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
