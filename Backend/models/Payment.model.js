import mongoose from "mongoose";
import { type } from "os";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },

    busId: { type: String },
    fromLat: { type: Number },
    fromLng: { type: Number },
    toLat: { type: Number },
    toLng: { type: Number },
    totalDistance: { type: String },
    passengerDistance: { type: String },
    ticketPrice: { type: Number, required: true },
    pricePerKm: { type: String },

    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
