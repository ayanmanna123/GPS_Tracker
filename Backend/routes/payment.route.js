import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  retryPayment,
} from "../controllers/Payment.controller.js";
import {
  requestRefund,
  processRefund,
  getRefundStatus,
  openDispute,
  addDisputeEvidence,
  resolveDispute,
  getDisputeDetails,
  getAllDisputes,
} from "../controllers/RefundDispute.controller.js";
import {
  getTransactionHistory,
  getTransactionDetails,
  exportTransactionHistory,
  getUserPaymentStats,
  getAdminAnalytics,
  getRevenueForecast,
  getPaymentMethodDistribution,
  getFailureAnalysis,
} from "../controllers/PaymentAnalytics.controller.js";
import {
  razorpayWebhook,
  stripeWebhook,
  paypalWebhook,
} from "../controllers/PaymentWebhook.controller.js";

const router = express.Router();

// ===========================
// PAYMENT MANAGEMENT ROUTES
// ===========================

// Create payment order (supports multiple gateways)
router.post("/create-order", isAuthenticated, createPaymentOrder);

// Verify payment
router.post("/verify", isAuthenticated, verifyPayment);

// Get payment details
router.get("/:paymentId", isAuthenticated, getPaymentDetails);

// Retry failed payment
router.post("/:paymentId/retry", isAuthenticated, retryPayment);

// ===========================
// REFUND MANAGEMENT ROUTES
// ===========================

// Request refund (User)
router.post("/:paymentId/refund/request", isAuthenticated, requestRefund);

// Process refund (Admin)
router.post("/:paymentId/refund/process", isAuthenticated, processRefund);

// Get refund status
router.get("/:paymentId/refund/status", isAuthenticated, getRefundStatus);

// ===========================
// DISPUTE MANAGEMENT ROUTES
// ===========================

// Open dispute (User)
router.post("/:paymentId/dispute/open", isAuthenticated, openDispute);

// Add dispute evidence (User)
router.post("/:paymentId/dispute/evidence", isAuthenticated, addDisputeEvidence);

// Resolve dispute (Admin)
router.post("/:paymentId/dispute/resolve", isAuthenticated, resolveDispute);

// Get dispute details
router.get("/:paymentId/dispute", isAuthenticated, getDisputeDetails);

// Get all disputes (Admin)
router.get("/disputes/all", isAuthenticated, getAllDisputes);

// ===========================
// TRANSACTION HISTORY ROUTES
// ===========================

// Get user transaction history
router.get("/transactions/history", isAuthenticated, getTransactionHistory);

// Get transaction details by transaction ID
router.get("/transactions/:transactionId", isAuthenticated, getTransactionDetails);

// Export transaction history (CSV/JSON)
router.get("/transactions/export", isAuthenticated, exportTransactionHistory);

// ===========================
// ANALYTICS & REPORTING ROUTES
// ===========================

// Get user payment statistics
router.get("/analytics/user-stats", isAuthenticated, getUserPaymentStats);

// Get admin analytics dashboard (Admin)
router.get("/analytics/admin", isAuthenticated, getAdminAnalytics);

// Get revenue forecast (Admin)
router.get("/analytics/forecast", isAuthenticated, getRevenueForecast);

// Get payment method distribution
router.get("/analytics/payment-methods", isAuthenticated, getPaymentMethodDistribution);

// Get failure analysis (Admin)
router.get("/analytics/failures", isAuthenticated, getFailureAnalysis);

// ===========================
// WEBHOOK ROUTES (NO AUTH)
// ===========================

// Razorpay webhook
router.post("/webhook/razorpay", express.raw({ type: "application/json" }), razorpayWebhook);

// Stripe webhook
router.post("/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);

// PayPal webhook
router.post("/webhook/paypal", express.json(), paypalWebhook);

export default router;
