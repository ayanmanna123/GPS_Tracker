import mongoose from "mongoose";

const BookingDetails = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: true,
  },
  seats: [{
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "confirmed", "cancelled"],
      default: "booked",
    },
  }],
  journeyDate: {
    type: Date,
    required: true,
  },
  fromLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
  },
  toLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  bookingStatus: {
    type: String,
    enum: ["active", "cancelled", "completed"],
    default: "active",
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique booking reference
BookingDetails.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
BookingDetails.index({ user: 1, bookingStatus: 1 });
BookingDetails.index({ bus: 1, journeyDate: 1 });
BookingDetails.index({ bookingReference: 1 });

const Booking = mongoose.model("Booking", BookingDetails);
export default Booking;
