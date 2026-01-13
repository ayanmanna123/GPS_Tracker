import Razorpay from "razorpay";
import Stripe from "stripe";
import axios from "axios";
import crypto from "crypto";
import Payment from "../models/Payment.model.js";
import User from "../models/User.model.js";
import { emitNotification } from "../utils/socket.js";

// Initialize Payment Gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID  ,
  key_secret: process.env.RAZORPAY_SECRET ,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2023-10-16",
});

// Helper to get client metadata
const getClientMetadata = (req) => ({
  ipAddress: req.ip || req.connection.remoteAddress,
  userAgent: req.headers["user-agent"],
  deviceType: /mobile/i.test(req.headers["user-agent"]) ? "mobile" : "desktop",
});

// ===========================
// 1. CREATE PAYMENT ORDER
// ===========================
export const createPaymentOrder = async (req, res) => {
  try {
    const {
      amount,
      gateway = "razorpay",
      busId,
      fromLat,
      fromLng,
      toLat,
      toLng,
      ticketData,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Get user info
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (!userInfo) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const metadata = getClientMetadata(req);
    const startTime = Date.now();

    let orderData = {};
    let payment;

    // Create order based on gateway
    switch (gateway) {
      case "razorpay":
        const razorpayOrder = await razorpay.orders.create({
          amount: amount * 100, // Convert to paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: userInfo._id.toString(),
            busId,
          },
        });

        payment = new Payment({
          user: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          busId,
          fromLat,
          fromLng,
          toLat,
          toLng,
          totalDistance: ticketData?.totalDistance,
          passengerDistance: ticketData?.passengerDistance,
          ticketPrice: amount,
          pricePerKm: ticketData?.pricePerKm,
          paymentGateway: "razorpay",
          razorpay_order_id: razorpayOrder.id,
          paymentStatus: "Pending",
          metadata,
          analytics: {
            processingTime: Date.now() - startTime,
            conversionSource: metadata.deviceType,
          },
        });

        payment.addAuditLog("order_created", "user", { gateway: "razorpay" }, metadata.ipAddress);
        await payment.save();

        orderData = {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID,
          paymentId: payment._id,
        };
        break;

      case "stripe":
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // Convert to cents
          currency: "inr",
          metadata: {
            userId: userInfo._id.toString(),
            busId,
          },
        });

        payment = new Payment({
          user: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          busId,
          fromLat,
          fromLng,
          toLat,
          toLng,
          totalDistance: ticketData?.totalDistance,
          passengerDistance: ticketData?.passengerDistance,
          ticketPrice: amount,
          pricePerKm: ticketData?.pricePerKm,
          paymentGateway: "stripe",
          stripe_payment_intent_id: paymentIntent.id,
          paymentStatus: "Pending",
          metadata,
          analytics: {
            processingTime: Date.now() - startTime,
            conversionSource: metadata.deviceType,
          },
        });

        payment.addAuditLog("order_created", "user", { gateway: "stripe" }, metadata.ipAddress);
        await payment.save();

        orderData = {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          paymentId: payment._id,
        };
        break;

      case "paypal":
        // PayPal order creation
        const paypalOrder = await createPayPalOrder(amount, userInfo, busId);
        
        payment = new Payment({
          user: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          busId,
          fromLat,
          fromLng,
          toLat,
          toLng,
          totalDistance: ticketData?.totalDistance,
          passengerDistance: ticketData?.passengerDistance,
          ticketPrice: amount,
          pricePerKm: ticketData?.pricePerKm,
          paymentGateway: "paypal",
          paypal_order_id: paypalOrder.id,
          paymentStatus: "Pending",
          metadata,
          analytics: {
            processingTime: Date.now() - startTime,
            conversionSource: metadata.deviceType,
          },
        });

        payment.addAuditLog("order_created", "user", { gateway: "paypal" }, metadata.ipAddress);
        await payment.save();

        orderData = {
          orderId: paypalOrder.id,
          approvalUrl: paypalOrder.links.find(link => link.rel === "approve")?.href,
          paymentId: payment._id,
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid payment gateway",
        });
    }

    res.json({
      success: true,
      message: "Payment order created successfully",
      gateway,
      ...orderData,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// ===========================
// 2. VERIFY PAYMENT
// ===========================
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, gateway } = req.body;
    const metadata = getClientMetadata(req);
    const startTime = Date.now();

    let payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    let isVerified = false;

    switch (gateway) {
      case "razorpay":
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const generatedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");

        isVerified = generatedSignature === razorpay_signature;

        if (isVerified) {
          payment.razorpay_payment_id = razorpay_payment_id;
          payment.razorpay_signature = razorpay_signature;
          payment.paymentStatus = "Success";
          payment.paymentMethod = "upi"; // Can be detected from Razorpay
        } else {
          payment.paymentStatus = "Failed";
          payment.failureInfo.attempts += 1;
          payment.failureInfo.lastAttempt = new Date();
          payment.failureInfo.errorMessage = "Signature verification failed";
        }
        break;

      case "stripe":
        const { stripe_payment_intent_id } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.retrieve(stripe_payment_intent_id);
        isVerified = paymentIntent.status === "succeeded";

        if (isVerified) {
          payment.stripe_charge_id = paymentIntent.charges.data[0]?.id;
          payment.paymentStatus = "Success";
          payment.paymentMethod = paymentIntent.charges.data[0]?.payment_method_details?.type || "card";
        } else {
          payment.paymentStatus = "Failed";
          payment.failureInfo.attempts += 1;
          payment.failureInfo.lastAttempt = new Date();
          payment.failureInfo.errorMessage = paymentIntent.last_payment_error?.message || "Payment failed";
        }
        break;

      case "paypal":
        const { paypal_order_id } = req.body;
        
        const paypalPayment = await capturePayPalOrder(paypal_order_id);
        isVerified = paypalPayment.status === "COMPLETED";

        if (isVerified) {
          payment.paypal_transaction_id = paypalPayment.purchase_units[0].payments.captures[0].id;
          payment.paymentStatus = "Success";
          payment.paymentMethod = "paypal";
        } else {
          payment.paymentStatus = "Failed";
          payment.failureInfo.attempts += 1;
          payment.failureInfo.lastAttempt = new Date();
          payment.failureInfo.errorMessage = "PayPal capture failed";
        }
        break;
    }

    // Update analytics
    payment.analytics.gatewayResponseTime = Date.now() - startTime;

    // Add audit log
    payment.addAuditLog(
      isVerified ? "payment_success" : "payment_failed",
      "user",
      { gateway, verified: isVerified },
      metadata.ipAddress
    );

    await payment.save();

    // Send notification
    if (isVerified && payment.user) {
      emitNotification(payment.user.toString(), {
        type: "payment_success",
        title: "Payment Successful",
        message: `Your ticket payment of ₹${payment.ticketPrice} was successful`,
        paymentId: payment._id,
      });
    }

    res.json({
      success: isVerified,
      message: isVerified ? "Payment verified successfully" : "Payment verification failed",
      paymentId: payment._id,
      transactionId: payment.transactionId,
      status: payment.paymentStatus,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// ===========================
// 3. GET PAYMENT DETAILS
// ===========================
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if user has permission
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (payment.user._id.toString() !== userInfo._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};

// ===========================
// 4. RETRY FAILED PAYMENT
// ===========================
export const retryPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { gateway } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check retry eligibility
    if (!payment.failureInfo.canRetry) {
      return res.status(400).json({
        success: false,
        message: "Payment retry not allowed",
      });
    }

    if (payment.failureInfo.attempts >= 3) {
      payment.failureInfo.canRetry = false;
      await payment.save();
      
      return res.status(400).json({
        success: false,
        message: "Maximum retry attempts exceeded",
      });
    }

    // Create new order with same details
    const newOrderReq = {
      body: {
        amount: payment.ticketPrice,
        gateway: gateway || payment.paymentGateway,
        busId: payment.busId,
        fromLat: payment.fromLat,
        fromLng: payment.fromLng,
        toLat: payment.toLat,
        toLng: payment.toLng,
        ticketData: {
          totalDistance: payment.totalDistance,
          passengerDistance: payment.passengerDistance,
          pricePerKm: payment.pricePerKm,
        },
      },
      auth: req.auth,
      ip: req.ip,
      headers: req.headers,
      connection: req.connection,
    };

    // Mark old payment as failed
    payment.paymentStatus = "Failed";
    payment.addAuditLog("payment_retry_initiated", "user", { newGateway: gateway }, req.ip);
    await payment.save();

    // Create new order
    await createPaymentOrder(newOrderReq, res);
  } catch (error) {
    console.error("Retry payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retry payment",
      error: error.message,
    });
  }
};

// ===========================
// HELPER FUNCTIONS
// ===========================

// PayPal Helper Functions
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

const createPayPalOrder = async (amount, userInfo, busId) => {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.post(
    `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (amount / 80).toFixed(2), // Convert INR to USD approximately
          },
          description: `Bus Ticket - ${busId}`,
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
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

const capturePayPalOrder = async (orderId) => {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.post(
    `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  retryPayment,
};
