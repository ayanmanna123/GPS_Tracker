import Payment from "../models/Payment.model.js";
import User from "../models/User.model.js";

// ===========================
// TRANSACTION HISTORY
// ===========================

// 1. Get User Transaction History
export const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, gateway, dateFrom, dateTo } = req.query;

    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build query
    const query = { user: userInfo._id };

    if (status && status !== "all") {
      query.paymentStatus = status;
    }

    if (gateway && gateway !== "all") {
      query.paymentGateway = gateway;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const transactions = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-auditLog -metadata"); // Exclude sensitive data

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction history",
      error: error.message,
    });
  }
};

// 2. Get Transaction Details with Audit Log
export const getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate("user", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Verify user ownership (or admin)
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (payment.user._id.toString() !== userInfo._id.toString()) {
      // Check if user is admin
      if (userInfo.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    res.json({
      success: true,
      transaction: payment,
      auditLog: payment.auditLog,
    });
  } catch (error) {
    console.error("Get transaction details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction details",
      error: error.message,
    });
  }
};

// 3. Export Transaction History (CSV/PDF)
export const exportTransactionHistory = async (req, res) => {
  try {
    const { format = "json", dateFrom, dateTo } = req.query;

    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const query = { user: userInfo._id };

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const transactions = await Payment.find(query)
      .sort({ createdAt: -1 })
      .select("transactionId ticketPrice paymentGateway paymentStatus createdAt busId");

    if (format === "csv") {
      // Generate CSV
      const csv = [
        "Transaction ID,Amount,Gateway,Status,Date,Bus ID",
        ...transactions.map(t => 
          `${t.transactionId},${t.ticketPrice},${t.paymentGateway},${t.paymentStatus},${t.createdAt},${t.busId || "N/A"}`
        )
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=transactions_${Date.now()}.csv`);
      return res.send(csv);
    }

    // Return JSON by default
    res.json({
      success: true,
      transactions,
      exportedAt: new Date(),
    });
  } catch (error) {
    console.error("Export transaction history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export transaction history",
      error: error.message,
    });
  }
};

// ===========================
// PAYMENT ANALYTICS
// ===========================

// 1. Get User Payment Statistics
export const getUserPaymentStats = async (req, res) => {
  try {
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const stats = await Payment.aggregate([
      { $match: { user: userInfo._id } },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$ticketPrice" },
                totalTransactions: { $sum: 1 },
                successfulPayments: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "Success"] }, 1, 0] },
                },
                failedPayments: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "Failed"] }, 1, 0] },
                },
                refundedAmount: {
                  $sum: { 
                    $cond: [
                      { $in: ["$paymentStatus", ["Refunded", "PartialRefund"]] }, 
                      "$refund.amount", 
                      0
                    ] 
                  },
                },
              },
            },
          ],
          byGateway: [
            {
              $group: {
                _id: "$paymentGateway",
                count: { $sum: 1 },
                amount: { $sum: "$ticketPrice" },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: "$paymentStatus",
                count: { $sum: 1 },
              },
            },
          ],
          recentTransactions: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                transactionId: 1,
                ticketPrice: 1,
                paymentStatus: 1,
                createdAt: 1,
                busId: 1,
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0],
    });
  } catch (error) {
    console.error("Get user payment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
      error: error.message,
    });
  }
};

// 2. Get Admin Analytics Dashboard
export const getAdminAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Calculate date range
    const dateFrom = new Date();
    switch (period) {
      case "7d":
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case "30d":
        dateFrom.setDate(dateFrom.getDate() - 30);
        break;
      case "90d":
        dateFrom.setDate(dateFrom.getDate() - 90);
        break;
      case "1y":
        dateFrom.setFullYear(dateFrom.getFullYear() - 1);
        break;
      default:
        dateFrom.setDate(dateFrom.getDate() - 30);
    }

    const analytics = await Payment.aggregate([
      { $match: { createdAt: { $gte: dateFrom } } },
      {
        $facet: {
          revenue: [
            {
              $group: {
                _id: null,
                totalRevenue: { 
                  $sum: { 
                    $cond: [{ $eq: ["$paymentStatus", "Success"] }, "$ticketPrice", 0] 
                  } 
                },
                totalRefunded: {
                  $sum: {
                    $cond: [
                      { $in: ["$paymentStatus", ["Refunded", "PartialRefund"]] },
                      "$refund.amount",
                      0,
                    ],
                  },
                },
                netRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "Success"] },
                      "$ticketPrice",
                      {
                        $cond: [
                          { $in: ["$paymentStatus", ["Refunded", "PartialRefund"]] },
                          { $multiply: ["$refund.amount", -1] },
                          0,
                        ],
                      },
                    ],
                  },
                },
              },
            },
          ],
          transactionVolume: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                successful: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "Success"] }, 1, 0] },
                },
                failed: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "Failed"] }, 1, 0] },
                },
                pending: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] },
                },
              },
            },
          ],
          gatewayPerformance: [
            {
              $group: {
                _id: "$paymentGateway",
                transactions: { $sum: 1 },
                revenue: {
                  $sum: { 
                    $cond: [{ $eq: ["$paymentStatus", "Success"] }, "$ticketPrice", 0] 
                  },
                },
                successRate: {
                  $avg: {
                    $cond: [{ $eq: ["$paymentStatus", "Success"] }, 100, 0],
                  },
                },
                avgProcessingTime: { $avg: "$analytics.processingTime" },
              },
            },
          ],
          refundStats: [
            {
              $group: {
                _id: "$refund.status",
                count: { $sum: 1 },
              },
            },
          ],
          disputeStats: [
            {
              $group: {
                _id: "$dispute.status",
                count: { $sum: 1 },
              },
            },
          ],
          dailyRevenue: [
            {
              $match: { paymentStatus: "Success" },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                revenue: { $sum: "$ticketPrice" },
                transactions: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          topRoutes: [
            {
              $match: { paymentStatus: "Success" },
            },
            {
              $group: {
                _id: "$busId",
                revenue: { $sum: "$ticketPrice" },
                bookings: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      period,
      analytics: analytics[0],
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Get admin analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

// 3. Get Revenue Forecast
export const getRevenueForecast = async (req, res) => {
  try {
    // Get last 90 days data
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 90);

    const historicalData = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFrom },
          paymentStatus: "Success",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$ticketPrice" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Simple moving average forecast (7-day)
    const recentData = historicalData.slice(-7);
    const avgDailyRevenue = recentData.reduce((sum, day) => sum + day.revenue, 0) / recentData.length;
    const avgDailyTransactions = recentData.reduce((sum, day) => sum + day.transactions, 0) / recentData.length;

    const forecast = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split("T")[0],
        estimatedRevenue: Math.round(avgDailyRevenue),
        estimatedTransactions: Math.round(avgDailyTransactions),
      });
    }

    res.json({
      success: true,
      historicalData,
      forecast,
      summary: {
        avgDailyRevenue: Math.round(avgDailyRevenue),
        avgDailyTransactions: Math.round(avgDailyTransactions),
        projected30DayRevenue: Math.round(avgDailyRevenue * 30),
      },
    });
  } catch (error) {
    console.error("Get revenue forecast error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate revenue forecast",
      error: error.message,
    });
  }
};

// 4. Get Payment Method Distribution
export const getPaymentMethodDistribution = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    const dateFrom = new Date();
    switch (period) {
      case "7d":
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case "30d":
        dateFrom.setDate(dateFrom.getDate() - 30);
        break;
      case "90d":
        dateFrom.setDate(dateFrom.getDate() - 90);
        break;
    }

    const distribution = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFrom },
          paymentStatus: "Success",
        },
      },
      {
        $group: {
          _id: {
            gateway: "$paymentGateway",
            method: "$paymentMethod",
          },
          count: { $sum: 1 },
          revenue: { $sum: "$ticketPrice" },
        },
      },
      {
        $group: {
          _id: "$_id.gateway",
          methods: {
            $push: {
              method: "$_id.method",
              count: "$count",
              revenue: "$revenue",
            },
          },
          totalCount: { $sum: "$count" },
          totalRevenue: { $sum: "$revenue" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({
      success: true,
      distribution,
      period,
    });
  } catch (error) {
    console.error("Get payment method distribution error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment method distribution",
      error: error.message,
    });
  }
};

// 5. Get Failure Analysis
export const getFailureAnalysis = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - (period === "7d" ? 7 : 30));

    const failureStats = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFrom },
          paymentStatus: "Failed",
        },
      },
      {
        $facet: {
          byGateway: [
            {
              $group: {
                _id: "$paymentGateway",
                failures: { $sum: 1 },
                avgAttempts: { $avg: "$failureInfo.attempts" },
              },
            },
          ],
          byErrorCode: [
            {
              $group: {
                _id: "$failureInfo.errorCode",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          timeline: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                failures: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      failureStats: failureStats[0],
      period,
    });
  } catch (error) {
    console.error("Get failure analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch failure analysis",
      error: error.message,
    });
  }
};

export default {
  getTransactionHistory,
  getTransactionDetails,
  exportTransactionHistory,
  getUserPaymentStats,
  getAdminAnalytics,
  getRevenueForecast,
  getPaymentMethodDistribution,
  getFailureAnalysis,
};
