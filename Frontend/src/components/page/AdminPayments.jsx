import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import Navbar from '../shared/Navbar';

const AdminPayments = () => {
  const { getAccessTokenSilently, user, isLoading } = useAuth0();
  const { usere, darktheme } = useSelector((store) => store.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: 'http://localhost:5000/api/v3',
        });
        
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/payments?page=${currentPage}&limit=10&filter=${filter}`, 
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setPayments(res.data.data.payments);
          setPagination(res.data.data.pagination);
        } else {
          throw new Error(res.data.message || 'Error fetching payments');
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err.message;
        setError(msg);
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchPayments();
    }
  }, [getAccessTokenSilently, user, isLoading, currentPage, filter]);

  const filteredPayments = payments.filter(payment => {
    if (filter === 'success') return payment.status === 'success';
    if (filter === 'failed') return payment.status === 'failed';
    if (filter === 'pending') return payment.status === 'pending';
    return true;
  });

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen ${darktheme 
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" 
        : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"} flex`}>
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-2xl font-semibold ${darktheme ? "text-white" : "text-gray-800"}`}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darktheme 
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" 
        : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"} flex`}>
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-xl ${darktheme ? "text-red-400" : "text-red-600"}`}>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!user || !usere || usere.status !== 'admin') {
    return (
      <div className={`min-h-screen ${darktheme 
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" 
        : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"} flex`}>
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-xl ${darktheme ? "text-red-400" : "text-red-600"}`}>Access Denied: Admin access required</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darktheme 
      ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" 
      : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"} flex flex-col`}>
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className={`text-3xl font-bold ${darktheme ? "text-white" : "text-gray-800"}`}>Payment Management</h1>
            <p className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}>View and manage all payment transactions</p>
          </div>

          {/* Filter Controls */}
          <div className="mb-6">
            <div className={`rounded-2xl p-2.5 transition-all duration-300 inline-flex gap-3 shadow-xl backdrop-blur-sm ${
              darktheme
                ? "bg-gray-900/70 border border-gray-700/50 shadow-gray-900/50"
                : "bg-white/80 border border-gray-200/50 shadow-gray-200/50"
            }`}>
              {['all', 'success', 'failed', 'pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl transition-all duration-500 font-semibold capitalize ${
                    filter === status
                      ? darktheme
                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-blue-500/50"
                        : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-blue-400/50"
                      : darktheme
                        ? "text-gray-400 hover:text-white hover:bg-gray-800/60"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}`}>
            <CardHeader>
              <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
                Payment Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className={`text-center py-8 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                  No payments found
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${darktheme ? "bg-gray-700/50" : "bg-gray-50"}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Transaction ID
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          User
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Amount
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Status
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Method
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${darktheme ? "divide-gray-700" : "divide-gray-200"}`}>
                      {filteredPayments.map((payment) => (
                        <tr key={payment._id} className={`${darktheme ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-mono ${darktheme ? "text-blue-400" : "text-blue-600"}`}>
                              {payment.transactionId || payment._id.substring(0, 12)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                              {payment.userId?.name || payment.userId?.email || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${darktheme ? "text-green-400" : "text-gray-900"}`}>
                              ${payment.amount?.toFixed(2) || '0.00'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'success' 
                                ? darktheme
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-green-100 text-green-800'
                                : payment.status === 'failed'
                                  ? darktheme
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-red-100 text-red-800'
                                  : darktheme
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm capitalize ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                              {payment.method || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className={`${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                              {new Date(payment.createdAt || payment.timestamp).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-700"}`}>
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, pagination.totalPayments)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalPayments}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={!pagination.hasPrev}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        pagination.hasPrev
                          ? darktheme
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : darktheme
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={!pagination.hasNext}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        pagination.hasNext
                          ? darktheme
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : darktheme
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;