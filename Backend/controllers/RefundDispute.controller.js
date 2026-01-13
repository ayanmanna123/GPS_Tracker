import Razorpay from "razorpay";
import Stripe from "stripe";
import axios from "axios";
import Payment from "../models/Payment.model.js";
import User from "../models/User.model.js";
import { emitNotification } from "../utils/socket.js";

// Initialize gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RPcZFwp7G16Gjf",
  key_secret: process.env.RAZORPAY_SECRET || "tUB9roW7JPgT4qJutNMxbrAZ",
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2023-10-16",
});

// ===========================
// REFUND MANAGEMENT
// ===========================

// 1. Request Refund
export const requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Refund reason is required",
      });
    }

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify user ownership
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (payment.user._id.toString() !== userInfo._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Check refund eligibility
    if (!payment.isRefundEligible) {
      return res.status(400).json({
        success: false,
        message: "This payment is not eligible for refund (24 hours elapsed or already refunded)",
      });
    }

    // Update refund status
    payment.refund.status = "requested";
    payment.refund.requestedAt = new Date();
    payment.refund.reason = reason;
    payment.refund.amount = payment.ticketPrice;
    payment.addAuditLog("refund_requested", "user", { reason }, req.ip);

    await payment.save();

    // Notify admins (implement admin notification system)
    emitNotification("admin", {
      type: "refund_request",
      title: "New Refund Request",
      message: `Refund requested for ${payment.transactionId}`,
      paymentId: payment._id,
    });

    res.json({
      success: true,
      message: "Refund request submitted successfully",
      payment,
    });
  } catch (error) {
    console.error("Request refund error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request refund",
      error: error.message,
    });
  }
};

// 2. Process Refund (Admin)
export const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action, adminNote, refundAmount } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.refund.status !== "requested") {
      return res.status(400).json({
        success: false,
        message: "No pending refund request",
      });
    }

    if (action === "reject") {
      payment.refund.status = "rejected";
      payment.refund.adminNote = adminNote;
      payment.refund.processedAt = new Date();
      payment.addAuditLog("refund_rejected", "admin", { adminNote }, req.ip);

      await payment.save();

      // Notify user
      emitNotification(payment.user._id.toString(), {
        type: "refund_rejected",
        title: "Refund Rejected",
        message: `Your refund request for ${payment.transactionId} was rejected`,
        paymentId: payment._id,
      });

      return res.json({
        success: true,
        message: "Refund rejected",
        payment,
      });
    }

    // Process refund through gateway
    payment.refund.status = "processing";
    payment.refund.processedAt = new Date();
    payment.refund.adminNote = adminNote;
    payment.refund.amount = refundAmount || payment.ticketPrice;

    let refundResult;

    try {
      switch (payment.paymentGateway) {
        case "razorpay":
          refundResult = await razorpay.payments.refund(payment.razorpay_payment_id, {
            amount: payment.refund.amount * 100, // Convert to paise
            notes: {
              reason: payment.refund.reason,
              adminNote,
            },
          });
          payment.refund.refundId = refundResult.id;
          break;

        case "stripe":
          refundResult = await stripe.refunds.create({
            payment_intent: payment.stripe_payment_intent_id,
            amount: payment.refund.amount * 100, // Convert to cents
            reason: "requested_by_customer",
            metadata: {
              reason: payment.refund.reason,
              adminNote,
            },
          });
          payment.refund.refundId = refundResult.id;
          break;

        case "paypal":
          // PayPal refund implementation
          refundResult = await processPayPalRefund(
            payment.paypal_transaction_id,
            payment.refund.amount
          );
          payment.refund.refundId = refundResult.id;
          break;

        default:
          throw new Error("Unsupported payment gateway");
      }

      // Update payment status
      payment.refund.status = "completed";
      payment.refund.completedAt = new Date();
      payment.paymentStatus = payment.refund.amount === payment.ticketPrice 
        ? "Refunded" 
        : "PartialRefund";
      payment.addAuditLog("refund_completed", "admin", { refundId: payment.refund.refundId }, req.ip);

      await payment.save();

      // Notify user
      emitNotification(payment.user._id.toString(), {
        type: "refund_completed",
        title: "Refund Processed",
        message: `Your refund of ₹${payment.refund.amount} has been processed`,
        paymentId: payment._id,
      });

      res.json({
        success: true,
        message: "Refund processed successfully",
        payment,
        refundId: payment.refund.refundId,
      });
    } catch (gatewayError) {
      payment.refund.status = "requested";
      payment.addAuditLog("refund_failed", "system", { error: gatewayError.message }, req.ip);
      await payment.save();

      throw gatewayError;
    }
  } catch (error) {
    console.error("Process refund error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message,
    });
  }
};

// 3. Get Refund Status
export const getRefundStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      refund: payment.refund,
      isRefundEligible: payment.isRefundEligible,
    });
  } catch (error) {
    console.error("Get refund status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch refund status",
      error: error.message,
    });
  }
};

// ===========================
// DISPUTE MANAGEMENT
// ===========================

// 1. Open Dispute
export const openDispute = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, description, evidence } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: "Reason and description are required",
      });
    }

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify user ownership
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (payment.user._id.toString() !== userInfo._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Check if already disputed
    if (payment.dispute.status !== "none") {
      return res.status(400).json({
        success: false,
        message: "Dispute already exists for this payment",
      });
    }

    // Open dispute
    payment.dispute.status = "opened";
    payment.dispute.openedAt = new Date();
    payment.dispute.reason = reason;
    payment.dispute.description = description;
    
    if (evidence && evidence.length > 0) {
      payment.dispute.evidence = evidence;
    }

    payment.paymentStatus = "Disputed";
    payment.addAuditLog("dispute_opened", "user", { reason }, req.ip);

    await payment.save();

    // Notify admins
    emitNotification("admin", {
      type: "dispute_opened",
      title: "New Payment Dispute",
      message: `Dispute opened for ${payment.transactionId}`,
      paymentId: payment._id,
    });

    res.json({
      success: true,
      message: "Dispute opened successfully",
      payment,
    });
  } catch (error) {
    console.error("Open dispute error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to open dispute",
      error: error.message,
    });
  }
};

// 2. Add Dispute Evidence
export const addDisputeEvidence = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { type, url, description } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.dispute.status === "none") {
      return res.status(400).json({
        success: false,
        message: "No active dispute",
      });
    }

    payment.dispute.evidence.push({
      type,
      url,
      description,
      uploadedAt: new Date(),
    });

    payment.addAuditLog("dispute_evidence_added", "user", { type }, req.ip);
    await payment.save();

    res.json({
      success: true,
      message: "Evidence added successfully",
      evidence: payment.dispute.evidence,
    });
  } catch (error) {
    console.error("Add dispute evidence error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add evidence",
      error: error.message,
    });
  }
};

// 3. Resolve Dispute (Admin)
export const resolveDispute = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { resolution, outcome, adminNote } = req.body;

    if (!resolution || !outcome) {
      return res.status(400).json({
        success: false,
        message: "Resolution and outcome are required",
      });
    }

    if (!["won", "lost", "resolved"].includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: "Invalid outcome",
      });
    }

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.dispute.status = outcome;
    payment.dispute.resolvedAt = new Date();
    payment.dispute.resolution = resolution;
    
    if (adminNote) {
      payment.dispute.adminNotes.push({
        note: adminNote,
        addedBy: "admin",
        addedAt: new Date(),
      });
    }

    // Update payment status based on outcome
    if (outcome === "won") {
      // User won, process refund if needed
      if (payment.refund.status === "none") {
        payment.refund.status = "approved";
        payment.refund.amount = payment.ticketPrice;
      }
    } else if (outcome === "lost") {
      payment.paymentStatus = "Success"; // Restore original status
    }

    payment.addAuditLog("dispute_resolved", "admin", { outcome, resolution }, req.ip);
    await payment.save();

    // Notify user
    emitNotification(payment.user._id.toString(), {
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `Your dispute for ${payment.transactionId} has been ${outcome}`,
      paymentId: payment._id,
    });

    res.json({
      success: true,
      message: "Dispute resolved successfully",
      payment,
    });
  } catch (error) {
    console.error("Resolve dispute error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve dispute",
      error: error.message,
    });
  }
};

// 4. Get Dispute Details
export const getDisputeDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      dispute: payment.dispute,
      payment: {
        transactionId: payment.transactionId,
        amount: payment.ticketPrice,
        status: payment.paymentStatus,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Get dispute details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dispute details",
      error: error.message,
    });
  }
};

// 5. Get All Disputes (Admin)
export const getAllDisputes = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 20 } = req.query;

    const query = status !== "all" 
      ? { "dispute.status": status }
      : { "dispute.status": { $ne: "none" } };

    const disputes = await Payment.find(query)
      .populate("user", "name email")
      .sort({ "dispute.openedAt": -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all disputes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch disputes",
      error: error.message,
    });
  }
};

// ===========================
// HELPER FUNCTIONS
// ===========================

const processPayPalRefund = async (transactionId, amount) => {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.post(
    `${process.env.PAYPAL_API_URL}/v2/payments/captures/${transactionId}/refund`,
    {
      amount: {
        currency_code: "USD",
        value: (amount / 80).toFixed(2),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const getPayPalAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

export default {
  requestRefund,
  processRefund,
  getRefundStatus,
  openDispute,
  addDisputeEvidence,
  resolveDispute,
  getDisputeDetails,
  getAllDisputes,
};
