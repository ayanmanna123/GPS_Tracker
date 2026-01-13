import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Activity,
  PieChart,
  BarChart3,
  Calendar,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { getUserPaymentStats } from "../../services/paymentService";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const PaymentAnalytics = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getUserPaymentStats(getAccessTokenSilently);
      setStats(response.stats);
    } catch (error) {
      toast.error("Failed to fetch payment analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start making transactions to see your payment analytics
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Book a Ticket
          </Button>
        </Card>
      </div>
    );
  }

  const overall = stats.overall[0] || {};
  const successRate = overall.totalTransactions > 0
    ? ((overall.successfulPayments / overall.totalTransactions) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your complete payment statistics and insights
            </p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Spent
            </h3>
            <p className="text-2xl font-bold">
              ₹{(overall.totalSpent || 0).toLocaleString()}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Transactions
            </h3>
            <p className="text-2xl font-bold">{overall.totalTransactions || 0}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Success Rate
            </h3>
            <p className="text-2xl font-bold">{successRate}%</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <RefreshCw className="w-6 h-6 text-orange-600" />
              </div>
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Refunds
            </h3>
            <p className="text-2xl font-bold">
              ₹{(overall.refundedAmount || 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Transaction Status Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Successful</span>
                </div>
                <span className="font-semibold">{overall.successfulPayments || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Failed</span>
                </div>
                <span className="font-semibold">{overall.failedPayments || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Gateway Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Gateway Usage</h3>
            <div className="space-y-4">
              {stats.byGateway?.map((gateway) => {
                const percentage = overall.totalTransactions > 0
                  ? ((gateway.count / overall.totalTransactions) * 100).toFixed(0)
                  : 0;
                
                return (
                  <div key={gateway._id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {gateway._id}
                      </span>
                      <span className="text-sm font-semibold">
                        {gateway.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {stats.recentTransactions?.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.paymentStatus === "Success"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      transaction.paymentStatus === "Success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.transactionId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.busId} • {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{transaction.ticketPrice}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.paymentStatus === "Success"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {transaction.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentAnalytics;
