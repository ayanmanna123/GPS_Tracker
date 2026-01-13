import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import {
  CreditCard,
  Wallet,
  Building2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Clock,
  Lock,
} from "lucide-react";
import { createPaymentOrder, verifyPayment, retryPayment } from "../../services/paymentService";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

const EnhancedPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();

  const { ticketData, busId, fromLat, fromLng, toLat, toLng } = location.state || {};

  const [selectedGateway, setSelectedGateway] = useState("razorpay");
  const [paymentStatus, setPaymentStatus] = useState("selecting"); // selecting, processing, success, failed
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Payment Gateways Configuration
  const paymentGateways = [
    {
      id: "razorpay",
      name: "Razorpay",
      description: "UPI, Cards, NetBanking, Wallets",
      icon: <CreditCard className="w-6 h-6" />,
      features: ["Instant Settlement", "Multiple Payment Methods", "Secure"],
      recommended: true,
    },
  ];

  useEffect(() => {
    if (!ticketData || !busId) {
      toast.error("Missing payment information");
      navigate(-1);
    }
  }, [ticketData, busId, navigate]);

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Load Stripe
  const loadStripe = async () => {
    if (!window.Stripe) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      document.body.appendChild(script);
      
      return new Promise((resolve) => {
        script.onload = () => resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY));
      });
    }
    return window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  };

  // Handle Payment Initiation
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentStatus("processing");

      // Create payment order
      const orderData = {
        amount: ticketData.ticketPrice,
        gateway: selectedGateway,
        busId,
        fromLat,
        fromLng,
        toLat,
        toLng,
        ticketData,
      };

      const orderResponse = await createPaymentOrder(getAccessTokenSilently, orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create payment order");
      }

      setPaymentId(orderResponse.paymentId);

      // Process based on gateway
      switch (selectedGateway) {
        case "razorpay":
          await processRazorpayPayment(orderResponse);
          break;
        default:
          throw new Error("Invalid payment gateway");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message);
      setPaymentStatus("failed");
      toast.error(error.message || "Payment failed");
      setRetryCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  // Razorpay Payment
  const processRazorpayPayment = async (orderData) => {
    const res = await loadRazorpayScript();
    if (!res) {
      throw new Error("Razorpay SDK failed to load");
    }

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: "GPS Tracker",
      description: `Bus Ticket - ${busId}`,
      handler: async (response) => {
        try {
          const verificationData = {
            paymentId: orderData.paymentId,
            gateway: "razorpay",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          const verifyResponse = await verifyPayment(getAccessTokenSilently, verificationData);

          if (verifyResponse.success) {
            setPaymentStatus("success");
            toast.success("Payment successful!");
            setTimeout(() => {
              navigate("/tickets");
            }, 2000);
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          throw error;
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      theme: {
        color: "#3b82f6",
      },
      modal: {
        ondismiss: () => {
          setPaymentStatus("failed");
          setError("Payment cancelled by user");
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // Stripe Payment
  const processStripePayment = async (orderData) => {
    const stripe = await loadStripe();
    const { clientSecret } = orderData;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

    if (stripeError) {
      throw new Error(stripeError.message);
    }

    if (paymentIntent.status === "succeeded") {
      const verifyResponse = await verifyPayment(getAccessTokenSilently, {
        paymentId: orderData.paymentId,
        gateway: "stripe",
        stripe_payment_intent_id: paymentIntent.id,
      });

      if (verifyResponse.success) {
        setPaymentStatus("success");
        toast.success("Payment successful!");
        setTimeout(() => navigate("/tickets"), 2000);
      }
    }
  };

  // PayPal Payment
  const processPayPalPayment = async (orderData) => {
    // Redirect to PayPal approval URL
    window.location.href = orderData.approvalUrl;
  };

  // Handle Retry Payment
  const handleRetryPayment = async () => {
    if (retryCount >= 3) {
      toast.error("Maximum retry attempts exceeded. Please try a different payment method.");
      return;
    }

    try {
      setLoading(true);
      await retryPayment(getAccessTokenSilently, paymentId, selectedGateway);
      await handlePayment();
    } catch (error) {
      toast.error("Retry failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Gateway Selection (Simplified for Razorpay only)
  const renderGatewaySelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Secure payment powered by Razorpay
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold mb-4">Payment Summary</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Bus ID</span>
            <span className="font-medium">{busId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Distance</span>
            <span className="font-medium">{ticketData?.passengerDistance} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Price/km</span>
            <span className="font-medium">₹{ticketData?.pricePerKm}</span>
          </div>
          <div className="border-t dark:border-gray-700 pt-2 mt-2 flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-blue-600">₹{ticketData?.ticketPrice}</span>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Razorpay Payment</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Supports UPI, Cards, NetBanking, and Wallets
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Lock className="w-4 h-4" />
          <span>Secure payment with 256-bit SSL encryption</span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Pay ₹{ticketData?.ticketPrice}
            </>
          )}
        </Button>
      </Card>
    </div>
  );

  // Render Processing State
  const renderProcessing = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Please wait while we process your payment...
      </p>
    </div>
  );

  // Render Success State
  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your ticket has been booked successfully
      </p>
      <Button onClick={() => navigate("/tickets")}>View My Tickets</Button>
    </div>
  );

  // Render Failed State
  const renderFailed = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-2">{error || "Something went wrong"}</p>
      {retryCount < 3 && (
        <p className="text-sm text-gray-500 mb-6">
          You can retry with the same or different payment method
        </p>
      )}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        {retryCount < 3 && (
          <Button onClick={handleRetryPayment} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Payment
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          {paymentStatus === "selecting" && renderGatewaySelection()}
          {paymentStatus === "processing" && renderProcessing()}
          {paymentStatus === "success" && renderSuccess()}
          {paymentStatus === "failed" && renderFailed()}
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPayment;
