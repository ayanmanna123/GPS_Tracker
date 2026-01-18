import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import Navbar from '../shared/Navbar';

const AdminDashboard = () => {
  const { getAccessTokenSilently, user, isLoading } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: 'http://localhost:5000/api/v3',
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.data.success) {
          setStats(res.data.data);
        } else {
          throw new Error(res.data.message || 'Error fetching stats');
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err.message;
        setError(msg);
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchStats();
    }
  }, [getAccessTokenSilently, user, isLoading]);

  const { darktheme } = useSelector((store) => store.auth);

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
            <h1 className={`text-3xl font-bold ${darktheme ? "text-white" : "text-gray-800"}`}>Admin Dashboard</h1>
            <p className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}>Welcome back, Administrator</p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${darktheme ? "text-gray-200" : "text-gray-700"}`}>
                Total Users
              </CardTitle>
              <div className={`p-3 rounded-full ${darktheme ? "bg-blue-500/20" : "bg-blue-100"}`}>
                <span className={`text-lg ${darktheme ? "text-blue-400" : "text-blue-600"}`}>👥</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                {stats?.totalUsers || 0}
              </div>
              <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${darktheme ? "text-gray-200" : "text-gray-700"}`}>
                Total Drivers
              </CardTitle>
              <div className={`p-3 rounded-full ${darktheme ? "bg-green-500/20" : "bg-green-100"}`}>
                <span className={`text-lg ${darktheme ? "text-green-400" : "text-green-600"}`}>🚗</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                {stats?.totalDrivers || 0}
              </div>
              <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                Active drivers
              </p>
            </CardContent>
          </Card>

          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${darktheme ? "text-gray-200" : "text-gray-700"}`}>
                Total Buses
              </CardTitle>
              <div className={`p-3 rounded-full ${darktheme ? "bg-yellow-500/20" : "bg-yellow-100"}`}>
                <span className={`text-lg ${darktheme ? "text-yellow-400" : "text-yellow-600"}`}>🚌</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                {stats?.totalBuses || 0}
              </div>
              <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                Operating buses
              </p>
            </CardContent>
          </Card>

          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${darktheme ? "text-gray-200" : "text-gray-700"}`}>
                Total Earnings
              </CardTitle>
              <div className={`p-3 rounded-full ${darktheme ? "bg-purple-500/20" : "bg-purple-100"}`}>
                <span className={`text-lg ${darktheme ? "text-purple-400" : "text-purple-600"}`}>💰</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                ${stats?.totalEarnings?.toFixed(2) || '0.00'}
              </div>
              <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                All time revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${darktheme ? "text-white" : "text-gray-800"}`}>
                Today's Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`${darktheme ? "text-gray-300" : "text-gray-600"}`}>
                    Successful Payments Today
                  </span>
                  <span className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"}`}>
                    {stats?.todaySuccessfulPayments || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${darktheme ? "text-gray-300" : "text-gray-600"}`}>
                    Monthly Earnings
                  </span>
                  <span className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"}`}>
                    ${stats?.monthlyEarnings?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${darktheme ? "text-gray-300" : "text-gray-600"}`}>
                    Total Payments
                  </span>
                  <span className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"}`}>
                    {stats?.totalPayments || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${darktheme ? "text-white" : "text-gray-800"}`}>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className={`py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center ${darktheme
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"}`}>
                  View Users
                </button>
                <button className={`py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center ${darktheme
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"}`}>
                  View Drivers
                </button>
                <button className={`py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center ${darktheme
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white"
                  : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"}`}>
                  Manage Buses
                </button>
                <button className={`py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center ${darktheme
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"}`}>
                  View Reports
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Placeholder */}
        <div className={`rounded-2xl shadow-xl p-8 border backdrop-blur-sm ${darktheme
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/90 border-white/50"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darktheme ? "text-white" : "text-gray-800"}`}>
            Recent Activity
          </h2>
          <p className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}>
            Recent activity and system events will appear here...
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AdminDashboard;