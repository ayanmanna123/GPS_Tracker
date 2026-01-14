import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-xl">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!user || !usere || usere.status !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-xl">Access Denied: Admin access required</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Administrator</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-500">Registered users</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <span className="text-green-600 text-lg">🚗</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDrivers || 0}</div>
              <p className="text-xs text-gray-500">Active drivers</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-full">
                <span className="text-yellow-600 text-lg">🚌</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBuses || 0}</div>
              <p className="text-xs text-gray-500">Operating buses</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <span className="text-purple-600 text-lg">💰</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalEarnings?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-gray-500">All time revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Today's Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Successful Payments Today</span>
                  <span className="font-semibold">{stats?.todaySuccessfulPayments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Earnings</span>
                  <span className="font-semibold">${stats?.monthlyEarnings?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="font-semibold">{stats?.totalPayments || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm transition-colors">
                  View Users
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm transition-colors">
                  View Drivers
                </button>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-sm transition-colors">
                  Manage Buses
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm transition-colors">
                  View Reports
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">Recent activity and system events will appear here...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;