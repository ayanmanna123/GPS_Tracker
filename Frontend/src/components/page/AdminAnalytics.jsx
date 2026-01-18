import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import Navbar from '../shared/Navbar';

const AdminAnalytics = () => {
  const { getAccessTokenSilently, user, isLoading } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [userTripStats, setUserTripStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [driverStats, setDriverStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: 'http://localhost:5000/api/v3',
        });
        
        // Fetch all analytics data concurrently
        const [userTripRes, dailyRes, driverRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/admin/user-trip-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/admin/daily-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/admin/driver-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        // Set data if successful
        if (userTripRes.data.success) {
          setUserTripStats(userTripRes.data.data);
        }
        if (dailyRes.data.success) {
          setDailyStats(dailyRes.data.data);
        }
        if (driverRes.data.success) {
          setDriverStats(driverRes.data.data);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err.message;
        setError(msg);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchData();
    }
  }, [getAccessTokenSilently, user, isLoading]);

  const { darktheme } = useSelector((store) => store.auth);

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen ${darktheme 
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" 
        : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"} flex`}>
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-2xl font-semibold ${darktheme ? "text-white" : "text-gray-800"}`}>Loading Analytics...</div>
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
            <h1 className={`text-3xl font-bold ${darktheme ? "text-white" : "text-gray-800"}`}>Analytics Dashboard</h1>
            <p className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}>Track user behavior, driver performance, and revenue metrics</p>
          </div>

        {/* User Trip Statistics */}
        <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/90 border-white/50"} mb-6`}>
          <CardHeader>
            <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
              User Trip Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userTripStats.length === 0 ? (
              <div className={`text-center py-4 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                No user trip data available
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${darktheme ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        User
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Email
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Trip Count
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Total Spent
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Avg Ticket Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darktheme ? "divide-gray-700" : "divide-gray-200"}`}>
                    {userTripStats.slice(0, 10).map((stat, index) => (
                      <tr key={index} className={`${darktheme ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${darktheme ? "text-white" : "text-gray-900"}`}>
                            {stat.userName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {stat.userEmail || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {stat.tripCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-green-400" : "text-gray-900"}`}>
                            ${stat.totalSpent?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-green-400" : "text-gray-900"}`}>
                            ${stat.avgTicketPrice?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Statistics */}
        <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/90 border-white/50"} mb-6`}>
          <CardHeader>
            <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
              Driver Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driverStats.length === 0 ? (
              <div className={`text-center py-4 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                No driver performance data available
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${darktheme ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Driver
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Email
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        License ID
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Total Buses
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Active Buses
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darktheme ? "divide-gray-700" : "divide-gray-200"}`}>
                    {driverStats.slice(0, 10).map((driver, index) => (
                      <tr key={index} className={`${darktheme ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${darktheme ? "text-white" : "text-gray-900"}`}>
                            {driver.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {driver.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {driver.licenceId || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {driver.totalBuses || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {driver.activeBuses || 0}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Revenue Statistics */}
        <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/90 border-white/50"}`}>
          <CardHeader>
            <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats.length === 0 ? (
              <div className={`text-center py-4 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                No daily revenue data available
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${darktheme ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Total Earnings
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Total Tickets
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Unique Users
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darktheme ? "divide-gray-700" : "divide-gray-200"}`}>
                    {dailyStats.slice(0, 10).map((day, index) => (
                      <tr key={index} className={`${darktheme ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${darktheme ? "text-white" : "text-gray-900"}`}>
                            {day.date || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-green-400" : "text-gray-900"}`}>
                            ${day.totalEarnings?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {day.totalTickets || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {day.uniqueUsersCount || 0}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
};

export default AdminAnalytics;