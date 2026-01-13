import crypto from "crypto";
import Stripe from "stripe";
import Payment from "../models/Payment.model.js";
import { emitNotification } from "../utils/socket.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2023-10-16",
});

// ===========================
// RAZORPAY WEBHOOK
// ===========================
export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    switch (event) {
      case "payment.captured":
        await handleRazorpayPaymentCaptured(payload);
        break;

      case "payment.failed":
        await handleRazorpayPaymentFailed(payload);
        break;

      case "refund.created":
        await handleRazorpayRefundCreated(payload);
        break;

      case "refund.processed":
        await handleRazorpayRefundProcessed(payload);
        break;

      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

// ===========================
// STRIPE WEBHOOK
// ===========================
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await handleStripePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handleStripePaymentFailed(event.data.object);
        break;

      case "charge.refunded":
        await handleStripeRefund(event.data.object);
        break;

      case "charge.dispute.created":
        await handleStripeDisputeCreated(event.data.object);
        break;

      case "charge.dispute.closed":
        await handleStripeDisputeClosed(event.data.object);
        break;

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

// ===========================
// PAYPAL WEBHOOK
// ===========================
export const paypalWebhook = async (req, res) => {
  try {
    // PayPal webhook verification (implement using PayPal SDK)
    const event = req.body;

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePayPalPaymentCompleted(event.resource);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handlePayPalPaymentDenied(event.resource);
        break;

      case "CUSTOMER.DISPUTE.CREATED":
        await handlePayPalDisputeCreated(event.resource);
        break;

      case "CUSTOMER.DISPUTE.RESOLVED":
        await handlePayPalDisputeResolved(event.resource);
        break;

      default:
        console.log(`Unhandled PayPal event: ${event.event_type}`);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

// ===========================
// RAZORPAY EVENT HANDLERS
// ===========================

const handleRazorpayPaymentCaptured = async (payload) => {
  const payment = await Payment.findOne({
    razorpay_order_id: payload.order_id,
  });

  if (payment) {
    payment.razorpay_payment_id = payload.id;
    payment.paymentStatus = "Success";
    payment.paymentMethod = payload.method || "unknown";
    payment.addAuditLog("payment_captured", "system", { paymentId: payload.id }, payload.ip);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "payment_success",
        title: "Payment Successful",
        message: `Your payment of ₹${payment.ticketPrice} has been confirmed`,
        paymentId: payment._id,
      });
    }
  }
};

const handleRazorpayPaymentFailed = async (payload) => {
  const payment = await Payment.findOne({
    razorpay_order_id: payload.order_id,
  });

  if (payment) {
    payment.paymentStatus = "Failed";
    payment.failureInfo.attempts += 1;
    payment.failureInfo.lastAttempt = new Date();
    payment.failureInfo.errorCode = payload.error_code;
    payment.failureInfo.errorMessage = payload.error_description;
    payment.addAuditLog("payment_failed", "system", payload.error_description, payload.ip);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "payment_failed",
        title: "Payment Failed",
        message: `Payment failed: ${payload.error_description}`,
        paymentId: payment._id,
      });
    }
  }
};

const handleRazorpayRefundCreated = async (payload) => {
  const payment = await Payment.findOne({
    razorpay_payment_id: payload.payment_id,
  });

  if (payment) {
    payment.refund.status = "processing";
    payment.refund.refundId = payload.id;
    payment.addAuditLog("refund_processing", "system", { refundId: payload.id }, null);

    await payment.save();
  }
};

const handleRazorpayRefundProcessed = async (payload) => {
  const payment = await Payment.findOne({
    "refund.refundId": payload.id,
  });

  if (payment) {
    payment.refund.status = "completed";
    payment.refund.completedAt = new Date();
    payment.paymentStatus = "Refunded";
    payment.addAuditLog("refund_completed", "system", { refundId: payload.id }, null);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "refund_completed",
        title: "Refund Completed",
        message: `Your refund of ₹${payment.refund.amount} has been processed`,
        paymentId: payment._id,
      });
    }
  }
};

// ===========================
// STRIPE EVENT HANDLERS
// ===========================

const handleStripePaymentSucceeded = async (paymentIntent) => {
  const payment = await Payment.findOne({
    stripe_payment_intent_id: paymentIntent.id,
  });

  if (payment) {
    payment.stripe_charge_id = paymentIntent.charges.data[0]?.id;
    payment.paymentStatus = "Success";
    payment.paymentMethod = paymentIntent.charges.data[0]?.payment_method_details?.type || "card";
    payment.addAuditLog("payment_succeeded", "system", { chargeId: payment.stripe_charge_id }, null);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "payment_success",
        title: "Payment Successful",
        message: `Your payment of ₹${payment.ticketPrice} has been confirmed`,
        paymentId: payment._id,
      });
    }
  }
};

const handleStripePaymentFailed = async (paymentIntent) => {
  const payment = await Payment.findOne({
    stripe_payment_intent_id: paymentIntent.id,
  });

  if (payment) {
    payment.paymentStatus = "Failed";
    payment.failureInfo.attempts += 1;
    payment.failureInfo.lastAttempt = new Date();
    payment.failureInfo.errorCode = paymentIntent.last_payment_error?.code;
    payment.failureInfo.errorMessage = paymentIntent.last_payment_error?.message;
    payment.addAuditLog("payment_failed", "system", paymentIntent.last_payment_error, null);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "payment_failed",
        title: "Payment Failed",
        message: `Payment failed: ${payment.failureInfo.errorMessage}`,
        paymentId: payment._id,
      });
    }
  }
};

const handleStripeRefund = async (charge) => {
  const payment = await Payment.findOne({
    stripe_charge_id: charge.id,
  });

  if (payment) {
    const refundAmount = charge.amount_refunded / 100; // Convert from cents

    payment.refund.status = "completed";
    payment.refund.completedAt = new Date();
    payment.refund.amount = refundAmount;
    payment.refund.refundId = charge.refunds.data[0]?.id;
    payment.paymentStatus = refundAmount === payment.ticketPrice ? "Refunded" : "PartialRefund";
    payment.addAuditLog("refund_completed", "system", { refundId: payment.refund.refundId }, null);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "refund_completed",
        title: "Refund Completed",
        message: `Your refund of ₹${refundAmount} has been processed`,
        paymentId: payment._id,
      });
    }
  }
};

const handleStripeDisputeCreated = async (dispute) => {
  const payment = await Payment.findOne({
    stripe_charge_id: dispute.charge,
  });

  if (payment) {
    payment.dispute.status = "opened";
    payment.dispute.openedAt = new Date();
    payment.dispute.reason = dispute.reason;
    payment.dispute.description = dispute.evidence_details?.due_by 
      ? `Dispute must be responded to by ${new Date(dispute.evidence_details.due_by * 1000)}`
      : "Dispute opened";
    payment.paymentStatus = "Disputed";
    payment.addAuditLog("dispute_opened", "system", { disputeId: dispute.id }, null);

    await payment.save();

    // Notify admin
    emitNotification("admin", {
      type: "dispute_opened",
      title: "Payment Dispute Opened",
      message: `Dispute opened for ${payment.transactionId}`,
      paymentId: payment._id,
    });
  }
};

const handleStripeDisputeClosed = async (dispute) => {
  const payment = await Payment.findOne({
    stripe_charge_id: dispute.charge,
  });

  if (payment) {
    payment.dispute.status = dispute.status === "won" ? "won" : "lost";
    payment.dispute.resolvedAt = new Date();
    payment.dispute.resolution = `Stripe dispute ${dispute.status}`;
    payment.paymentStatus = dispute.status === "won" ? "Disputed" : "Success";
    payment.addAuditLog("dispute_closed", "system", { outcome: dispute.status }, null);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "dispute_resolved",
        title: "Dispute Resolved",
        message: `Your dispute has been ${dispute.status}`,
        paymentId: payment._id,
      });
    }
  }
};

// ===========================
// PAYPAL EVENT HANDLERS
// ===========================

const handlePayPalPaymentCompleted = async (resource) => {
  const payment = await Payment.findOne({
    paypal_order_id: resource.supplementary_data?.related_ids?.order_id,
  });

  if (payment) {
    payment.paypal_transaction_id = resource.id;
    payment.paymentStatus = "Success";
    payment.paymentMethod = "paypal";
    payment.addAuditLog("payment_completed", "system", { transactionId: resource.id }, null);

    await payment.save();

    // Send notification
    if (payment.user) {
      emitNotification(payment.user.toString(), {
        type: "payment_success",
        title: "Payment Successful",
        message: `Your PayPal payment of ₹${payment.ticketPrice} has been confirmed`,
        paymentId: payment._id,
      });
    }
  }
};

const handlePayPalPaymentDenied = async (resource) => {
  const payment = await Payment.findOne({
    paypal_order_id: resource.supplementary_data?.related_ids?.order_id,
  });

  if (payment) {
    payment.paymentStatus = "Failed";
    payment.failureInfo.attempts += 1;
    payment.failureInfo.lastAttempt = new Date();
    payment.failureInfo.errorMessage = "Payment denied by PayPal";
    payment.addAuditLog("payment_denied", "system", { reason: "denied" }, null);

    await payment.save();
  }
};

const handlePayPalDisputeCreated = async (resource) => {
  const payment = await Payment.findOne({
    paypal_transaction_id: resource.disputed_transactions[0]?.seller_transaction_id,
  });

  if (payment) {
    payment.dispute.status = "opened";
    payment.dispute.openedAt = new Date();
    payment.dispute.reason = resource.reason;
    payment.dispute.description = resource.dispute_life_cycle_stage;
    payment.paymentStatus = "Disputed";
    payment.addAuditLog("dispute_opened", "system", { disputeId: resource.dispute_id }, null);

    await payment.save();
  }
};

const handlePayPalDisputeResolved = async (resource) => {
  const payment = await Payment.findOne({
    paypal_transaction_id: resource.disputed_transactions[0]?.seller_transaction_id,
  });

  if (payment) {
    payment.dispute.status = resource.outcome?.outcome_code === "RESOLVED_BUYER_FAVOUR" ? "lost" : "won";
    payment.dispute.resolvedAt = new Date();
    payment.dispute.resolution = resource.outcome?.outcome_code;
    payment.addAuditLog("dispute_resolved", "system", { outcome: resource.outcome?.outcome_code }, null);

    await payment.save();
  }
};

export default {
  razorpayWebhook,
  stripeWebhook,
  paypalWebhook,
};
