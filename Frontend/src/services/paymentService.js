import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

// Helper to get auth token
const getAuthToken = async (getAccessTokenSilently) => {
  try {
    return await getAccessTokenSilently();
  } catch (error) {
    console.error("Failed to get auth token:", error);
    throw error;
  }
};

// ===========================
// PAYMENT MANAGEMENT
// ===========================

export const createPaymentOrder = async (getAccessTokenSilently, orderData) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.post(
    `${BASE_URL}/payment/create-order`,
    orderData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const verifyPayment = async (getAccessTokenSilently, verificationData) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.post(
    `${BASE_URL}/payment/verify`,
    verificationData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getPaymentDetails = async (getAccessTokenSilently, paymentId) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const retryPayment = async (getAccessTokenSilently, paymentId, gateway) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.post(
    `${BASE_URL}/payment/${paymentId}/retry`,
    { gateway },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// ===========================
// REFUND MANAGEMENT
// ===========================

export const requestRefund = async (getAccessTokenSilently, paymentId, reason) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.post(
    `${BASE_URL}/payment/${paymentId}/refund/request`,
    { reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getRefundStatus = async (getAccessTokenSilently, paymentId) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/${paymentId}/refund/status`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// ===========================
// DISPUTE MANAGEMENT
// ===========================

export const openDispute = async (getAccessTokenSilently, paymentId, disputeData) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.post(
    `${BASE_URL}/payment/${paymentId}/dispute/open`,
    disputeData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const addDisputeEvidence = async (getAccessTokenSilently, paymentId, evidence) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.post(
    `${BASE_URL}/payment/${paymentId}/dispute/evidence`,
    evidence,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getDisputeDetails = async (getAccessTokenSilently, paymentId) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/${paymentId}/dispute`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// ===========================
// TRANSACTION HISTORY
// ===========================

export const getTransactionHistory = async (getAccessTokenSilently, params = {}) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(
    `${BASE_URL}/payment/transactions/history?${queryString}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getTransactionDetails = async (getAccessTokenSilently, transactionId) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/transactions/${transactionId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const exportTransactionHistory = async (getAccessTokenSilently, params = {}) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(
    `${BASE_URL}/payment/transactions/export?${queryString}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: params.format === "csv" ? "blob" : "json",
    }
  );
  return response.data;
};

// ===========================
// ANALYTICS
// ===========================

export const getUserPaymentStats = async (getAccessTokenSilently) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/analytics/user-stats`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getAdminAnalytics = async (getAccessTokenSilently, period = "30d") => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/analytics/admin?period=${period}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getRevenueForecast = async (getAccessTokenSilently) => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/analytics/forecast`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getPaymentMethodDistribution = async (getAccessTokenSilently, period = "30d") => {
  const token = await getAuthToken(getAccessTokenSilently);
  const response = await axios.get(
    `${BASE_URL}/payment/analytics/payment-methods?period=${period}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  retryPayment,
  requestRefund,
  getRefundStatus,
  openDispute,
  addDisputeEvidence,
  getDisputeDetails,
  getTransactionHistory,
  getTransactionDetails,
  exportTransactionHistory,
  getUserPaymentStats,
  getAdminAnalytics,
  getRevenueForecast,
  getPaymentMethodDistribution,
};
