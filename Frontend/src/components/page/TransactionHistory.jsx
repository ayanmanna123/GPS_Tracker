import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import {
  Download,
  Filter,
  Search,
  Receipt,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  getTransactionHistory,
  getTransactionDetails,
  exportTransactionHistory,
  requestRefund,
  openDispute,
} from "../../services/paymentService";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

const TransactionHistory = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    gateway: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [disputeData, setDisputeData] = useState({
    reason: "",
    description: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactionHistory(getAccessTokenSilently, filters);
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to fetch transactions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const data = await exportTransactionHistory(getAccessTokenSilently, {
        format,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      if (format === "csv") {
        const blob = new Blob([data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions_${Date.now()}.csv`;
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions_${Date.now()}.json`;
        a.click();
      }

      toast.success("Transactions exported successfully");
    } catch (error) {
      toast.error("Failed to export transactions");
    }
  };

  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for refund");
      return;
    }

    try {
      await requestRefund(getAccessTokenSilently, selectedTransaction._id, refundReason);
      toast.success("Refund request submitted successfully");
      setShowRefundModal(false);
      setRefundReason("");
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request refund");
    }
  };

  const handleOpenDispute = async () => {
    if (!disputeData.reason.trim() || !disputeData.description.trim()) {
      toast.error("Please fill in all dispute fields");
      return;
    }

    try {
      await openDispute(getAccessTokenSilently, selectedTransaction._id, disputeData);
      toast.success("Dispute opened successfully");
      setShowDisputeModal(false);
      setDisputeData({ reason: "", description: "" });
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to open dispute");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Refunded":
      case "PartialRefund":
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case "Disputed":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Receipt className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Success":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Refunded":
      case "PartialRefund":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Disputed":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your payment transactions
          </p>
        </div>

        {/* Filters & Actions */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                <option value="all">All Status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
                <option value="Disputed">Disputed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gateway</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={filters.gateway}
                onChange={(e) => setFilters({ ...filters, gateway: e.target.value, page: 1 })}
              >
                <option value="all">All Gateways</option>
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </Card>

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start booking tickets to see your transaction history
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getStatusIcon(transaction.paymentStatus)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {transaction.transactionId}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.paymentStatus)}`}>
                            {transaction.paymentStatus}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Amount</p>
                            <p className="font-medium">₹{transaction.ticketPrice}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Gateway</p>
                            <p className="font-medium capitalize">{transaction.paymentGateway}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Date</p>
                            <p className="font-medium">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {transaction.busId && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Bus: {transaction.busId} | Distance: {transaction.passengerDistance} km
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {transaction.paymentStatus === "Success" && 
                       transaction.refund?.status === "none" && 
                       transaction.isRefundEligible && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowRefundModal(true);
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Request Refund
                        </Button>
                      )}

                      {transaction.paymentStatus === "Success" && 
                       transaction.dispute?.status === "none" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDisputeModal(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open Dispute
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Refund/Dispute Status */}
                  {transaction.refund?.status !== "none" && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Refund Status: {transaction.refund.status}
                      </p>
                      {transaction.refund.reason && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Reason: {transaction.refund.reason}
                        </p>
                      )}
                    </div>
                  )}

                  {transaction.dispute?.status !== "none" && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                        Dispute Status: {transaction.dispute.status}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={filters.page === pagination.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Request Refund</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Transaction: {selectedTransaction?.transactionId}
              </p>
              <textarea
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mb-4"
                rows={4}
                placeholder="Please provide a reason for the refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestRefund}
                  className="flex-1"
                >
                  Submit Request
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Open Dispute</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Transaction: {selectedTransaction?.transactionId}
              </p>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mb-3"
                value={disputeData.reason}
                onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
              >
                <option value="">Select Reason</option>
                <option value="service_not_provided">Service Not Provided</option>
                <option value="incorrect_amount">Incorrect Amount Charged</option>
                <option value="duplicate_charge">Duplicate Charge</option>
                <option value="other">Other</option>
              </select>
              <textarea
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mb-4"
                rows={4}
                placeholder="Please describe your issue in detail..."
                value={disputeData.description}
                onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDisputeModal(false);
                    setDisputeData({ reason: "", description: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOpenDispute}
                  className="flex-1"
                >
                  Submit Dispute
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
