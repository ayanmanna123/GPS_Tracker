import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // User Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },

    // Ticket Information
    busId: { type: String },
    fromLat: { type: Number },
    fromLng: { type: Number },
    toLat: { type: Number },
    toLng: { type: Number },
    totalDistance: { type: String },
    passengerDistance: { type: String },
    ticketPrice: { type: Number, required: true },
    pricePerKm: { type: String },

    // Payment Gateway Selection
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "paypal"],
      default: "razorpay",
      required: true,
    },

    // Razorpay Fields
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },

    // Stripe Fields
    stripe_payment_intent_id: { type: String },
    stripe_charge_id: { type: String },
    stripe_customer_id: { type: String },

    // PayPal Fields
    paypal_order_id: { type: String },
    paypal_payer_id: { type: String },
    paypal_transaction_id: { type: String },

    // Universal Payment Fields
    transactionId: { 
      type: String, 
      unique: true, 
      sparse: true,
      index: true 
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded", "PartialRefund", "Disputed", "Processing"],
      default: "Pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "paypal", "unknown"],
      default: "unknown",
    },

    // Refund Management
    refund: {
      status: {
        type: String,
        enum: ["none", "requested", "processing", "approved", "rejected", "completed"],
        default: "none",
      },
      requestedAt: { type: Date },
      processedAt: { type: Date },
      completedAt: { type: Date },
      amount: { type: Number, default: 0 },
      reason: { type: String, maxlength: 500 },
      adminNote: { type: String, maxlength: 500 },
      refundId: { type: String }, // Gateway refund ID
      refundMethod: { type: String }, // original/store_credit
    },

    // Dispute Management
    dispute: {
      status: {
        type: String,
        enum: ["none", "opened", "under_review", "resolved", "lost", "won"],
        default: "none",
      },
      openedAt: { type: Date },
      resolvedAt: { type: Date },
      reason: { type: String, maxlength: 500 },
      description: { type: String, maxlength: 1000 },
      evidence: [{
        type: { type: String }, // document, image, message
        url: { type: String },
        description: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      }],
      adminNotes: [{
        note: { type: String },
        addedBy: { type: String },
        addedAt: { type: Date, default: Date.now },
      }],
      resolution: { type: String, maxlength: 1000 },
    },

    // Transaction Metadata
    metadata: {
      ipAddress: { type: String },
      userAgent: { type: String },
      deviceType: { type: String },
      location: {
        country: { type: String },
        state: { type: String },
        city: { type: String },
      },
    },

    // Failure & Retry Management
    failureInfo: {
      attempts: { type: Number, default: 0 },
      lastAttempt: { type: Date },
      errorCode: { type: String },
      errorMessage: { type: String },
      canRetry: { type: Boolean, default: true },
    },

    // Audit Trail
    auditLog: [{
      action: { type: String }, // created, payment_success, payment_failed, refund_requested, etc.
      performedBy: { type: String }, // user, admin, system
      timestamp: { type: Date, default: Date.now },
      details: { type: mongoose.Schema.Types.Mixed },
      ipAddress: { type: String },
    }],

    // Analytics & Reporting
    analytics: {
      processingTime: { type: Number }, // milliseconds
      gatewayResponseTime: { type: Number },
      conversionSource: { type: String }, // web, mobile, api
      campaignId: { type: String },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ paymentStatus: 1, createdAt: -1 });
paymentSchema.index({ paymentGateway: 1 });
paymentSchema.index({ "refund.status": 1 });
paymentSchema.index({ "dispute.status": 1 });
paymentSchema.index({ transactionId: 1 });

// Virtual for refund eligibility
paymentSchema.virtual("isRefundEligible").get(function () {
  if (this.paymentStatus !== "Success") return false;
  if (this.refund.status !== "none") return false;
  
  // Refund allowed within 24 hours
  const hoursSincePurchase = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return hoursSincePurchase <= 24;
});

// Method to add audit log entry
paymentSchema.methods.addAuditLog = function(action, performedBy, details, ipAddress) {
  this.auditLog.push({
    action,
    performedBy,
    details,
    ipAddress,
    timestamp: new Date(),
  });
};

// Generate unique transaction ID
paymentSchema.pre("save", function(next) {
  if (!this.transactionId && this.isNew) {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
