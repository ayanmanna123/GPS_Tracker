import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import Navbar from '../shared/Navbar';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const AdminAnalytics = () => {
  const { getAccessTokenSilently, user, isLoading } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [userTripStats, setUserTripStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [driverStats, setDriverStats] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [driverPerformanceData, setDriverPerformanceData] = useState([]);
  const [busHeatmapData, setBusHeatmapData] = useState([]);
  const [ticketHeatmapData, setTicketHeatmapData] = useState([]);
  const [activeHeatmap, setActiveHeatmap] = useState('bus'); // 'bus' or 'ticket'
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
          // Process user growth data for chart
          const growthData = userTripRes.data.data
            .slice(0, 10)
            .map(stat => ({
              name: stat.userName || 'Unknown',
              trips: stat.tripCount || 0,
              spent: stat.totalSpent || 0
            }))
            .sort((a, b) => b.trips - a.trips);
          setUserGrowthData(growthData);
          
          // Generate sample heatmap data for ticket purchases
          // In a real app, this would come from actual ticket purchase locations
          const ticketData = generateSampleTicketHeatmapData(userTripRes.data.data);
          setTicketHeatmapData(ticketData);
        }
        
        if (dailyRes.data.success) {
          setDailyStats(dailyRes.data.data);
          // Process revenue trend data for chart
          const trendData = dailyRes.data.data
            .map(day => ({
              date: day.date,
              earnings: day.totalEarnings || 0,
              tickets: day.totalTickets || 0
            }))
            .reverse(); // Reverse to show chronological order
          setRevenueTrendData(trendData);
        }
        
        if (driverRes.data.success) {
          setDriverStats(driverRes.data.data);
          // Process driver performance data for pie chart
          const totalActive = driverRes.data.data.reduce((sum, driver) => sum + (driver.activeBuses || 0), 0);
          const totalInactive = driverRes.data.data.reduce((sum, driver) => sum + ((driver.totalBuses || 0) - (driver.activeBuses || 0)), 0);
          
          setDriverPerformanceData([
            { name: 'Active Buses', value: totalActive },
            { name: 'Inactive Buses', value: totalInactive }
          ]);
          
          // Generate sample heatmap data for bus activity
          // In a real app, this would come from actual bus GPS coordinates
          const busData = generateSampleBusHeatmapData(driverRes.data.data);
          setBusHeatmapData(busData);
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

  // Helper function to generate sample bus heatmap data
  const generateSampleBusHeatmapData = (drivers) => {
    // Sample Delhi/NCR coordinates for demonstration
    const baseCoords = [
      [28.6139, 77.2090], // Connaught Place
      [28.5355, 77.3910], // Noida
      [28.4595, 77.0266], // Gurgaon
      [28.7041, 77.1025], // North Delhi
      [28.5351, 77.3910], // Faridabad
      [28.6692, 77.4538], // Ghaziabad
      [28.4089, 77.3178], // Greater Noida
      [28.6267, 77.2156], // South Delhi
      [28.6863, 77.2212], // East Delhi
      [28.6328, 77.2197], // Central Delhi
    ];
    
    // Generate heatmap points with intensity based on bus activity
    return baseCoords.flatMap((coord, index) => {
      const intensity = Math.random() * 0.8 + 0.2; // Random intensity between 0.2 and 1.0
      const points = [];
      
      // Create cluster of points around each major location
      for (let i = 0; i < 5; i++) {
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;
        points.push([
          coord[0] + latOffset,
          coord[1] + lngOffset,
          intensity
        ]);
      }
      
      return points;
    });
  };

  // Helper function to generate sample ticket heatmap data
  const generateSampleTicketHeatmapData = (users) => {
    // Sample popular locations where people buy tickets
    const ticketLocations = [
      [28.6139, 77.2090], // Connaught Place (shopping/business district)
      [28.5355, 77.3910], // Noida Sector 18 (commercial hub)
      [28.4595, 77.0266], // MG Road Gurgaon (business district)
      [28.7041, 77.1025], // Model Town (residential area)
      [28.5351, 77.3910], // Faridabad (industrial area)
      [28.6692, 77.4538], // Vaishali (residential/commercial)
      [28.4089, 77.3178], // Knowledge Park (educational hub)
      [28.6267, 77.2156], // Defence Colony (residential)
      [28.6863, 77.2212], // Welcome Metro Station (transport hub)
      [28.6328, 77.2197], // Rajiv Chowk (central business district)
    ];
    
    return ticketLocations.flatMap((coord, index) => {
      const intensity = Math.random() * 0.9 + 0.1; // Random intensity between 0.1 and 1.0
      const points = [];
      
      // Create cluster of points around each ticket purchasing location
      for (let i = 0; i < 3; i++) {
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;
        points.push([
          coord[0] + latOffset,
          coord[1] + lngOffset,
          intensity
        ]);
      }
      
      return points;
    });
  };

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
            <p className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}>Visual insights into user behavior, driver performance, and revenue trends</p>
          </div>

          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50"
              : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"}
            `}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${darktheme ? "text-blue-200" : "text-blue-700"}`}>
                  Total Revenue
                </CardTitle>
                <div className={`p-2 rounded-full ${darktheme ? "bg-blue-500/20" : "bg-blue-200"}`}>
                  <span className={`text-lg ${darktheme ? "text-blue-400" : "text-blue-600"}`}>💰</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                  ${dailyStats.reduce((sum, day) => sum + (day.totalEarnings || 0), 0).toFixed(2) || '0.00'}
                </div>
                <p className={`text-xs ${darktheme ? "text-blue-300" : "text-blue-600"}`}>30-day total</p>
              </CardContent>
            </Card>

            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50"
              : "bg-gradient-to-br from-green-50 to-green-100 border-green-200"}
            `}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${darktheme ? "text-green-200" : "text-green-700"}`}>
                  Active Users
                </CardTitle>
                <div className={`p-2 rounded-full ${darktheme ? "bg-green-500/20" : "bg-green-200"}`}>
                  <span className={`text-lg ${darktheme ? "text-green-400" : "text-green-600"}`}>👥</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                  {dailyStats.reduce((sum, day) => sum + (day.uniqueUsersCount || 0), 0) || 0}
                </div>
                <p className={`text-xs ${darktheme ? "text-green-300" : "text-green-600"}`}>30-day unique</p>
              </CardContent>
            </Card>

            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50"
              : "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"}
            `}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${darktheme ? "text-purple-200" : "text-purple-700"}`}>
                  Top Performer
                </CardTitle>
                <div className={`p-2 rounded-full ${darktheme ? "bg-purple-500/20" : "bg-purple-200"}`}>
                  <span className={`text-lg ${darktheme ? "text-purple-400" : "text-purple-600"}`}>🏆</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-bold truncate ${darktheme ? "text-white" : "text-gray-900"}`}>
                  {userTripStats[0]?.userName || 'N/A'}
                </div>
                <p className={`text-xs ${darktheme ? "text-purple-300" : "text-purple-600"}`}>
                  {userTripStats[0]?.tripCount || 0} trips
                </p>
              </CardContent>
            </Card>

            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50"
              : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"}
            `}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${darktheme ? "text-orange-200" : "text-orange-700"}`}>
                  Active Buses
                </CardTitle>
                <div className={`p-2 rounded-full ${darktheme ? "bg-orange-500/20" : "bg-orange-200"}`}>
                  <span className={`text-lg ${darktheme ? "text-orange-400" : "text-orange-600"}`}>🚌</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                  {driverPerformanceData.find(d => d.name === 'Active Buses')?.value || 0}
                </div>
                <p className={`text-xs ${darktheme ? "text-orange-300" : "text-orange-600"}`}>Currently operating</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"}
            `}>
              <CardHeader>
                <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
                  📈 Revenue Trend (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueTrendData.length === 0 ? (
                  <div className={`text-center py-8 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                    No revenue data available
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darktheme ? "#374151" : "#e5e7eb"} />
                        <XAxis 
                          dataKey="date" 
                          stroke={darktheme ? "#9ca3af" : "#6b7280"}
                          fontSize={12}
                          tick={{ fill: darktheme ? "#d1d5db" : "#374151" }}
                        />
                        <YAxis 
                          stroke={darktheme ? "#9ca3af" : "#6b7280"}
                          fontSize={12}
                          tick={{ fill: darktheme ? "#d1d5db" : "#374151" }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: darktheme ? "#1f2937" : "#ffffff",
                            borderColor: darktheme ? "#374151" : "#e5e7eb",
                            color: darktheme ? "#f9fafb" : "#111827"
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="earnings" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Daily Earnings ($)"
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Growth Chart */}
            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"}
            `}>
              <CardHeader>
                <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
                  👥 Top User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userGrowthData.length === 0 ? (
                  <div className={`text-center py-8 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                    No user data available
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darktheme ? "#374151" : "#e5e7eb"} />
                        <XAxis 
                          dataKey="name" 
                          stroke={darktheme ? "#9ca3af" : "#6b7280"}
                          fontSize={10}
                          tick={{ fill: darktheme ? "#d1d5db" : "#374151", angle: -45, textAnchor: 'end' }}
                          height={60}
                        />
                        <YAxis 
                          stroke={darktheme ? "#9ca3af" : "#6b7280"}
                          fontSize={12}
                          tick={{ fill: darktheme ? "#d1d5db" : "#374151" }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: darktheme ? "#1f2937" : "#ffffff",
                            borderColor: darktheme ? "#374151" : "#e5e7eb",
                            color: darktheme ? "#f9fafb" : "#111827"
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="trips" 
                          fill="#10b981" 
                          name="Trips Taken"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Driver Performance Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"}
            `}>
              <CardHeader>
                <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
                  🚌 Bus Fleet Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driverPerformanceData.length === 0 ? (
                  <div className={`text-center py-8 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                    No driver data available
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={driverPerformanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {driverPerformanceData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? (darktheme ? "#10b981" : "#10b981") : (darktheme ? "#ef4444" : "#ef4444")} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: darktheme ? "#1f2937" : "#ffffff",
                            borderColor: darktheme ? "#374151" : "#e5e7eb",
                            color: darktheme ? "#f9fafb" : "#111827"
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Driver Stats Table */}
            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"}
            `}>
              <CardHeader>
                <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
                  🚗 Driver Performance Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driverStats.length === 0 ? (
                  <div className={`text-center py-4 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                    No driver data available
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl max-h-80">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className={`${darktheme ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <tr>
                          <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                            Driver
                          </th>
                          <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                            Buses
                          </th>
                          <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                            Active
                          </th>
                          <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${darktheme ? "divide-gray-700" : "divide-gray-200"} overflow-y-auto max-h-64 block`}>
                        {driverStats.slice(0, 8).map((driver, index) => (
                          <tr key={index} className={`${darktheme ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} block mb-2`}>
                            <td className="px-4 py-2">
                              <div className={`text-sm font-medium ${darktheme ? "text-white" : "text-gray-900"}`}>
                                {driver.name || 'N/A'}
                              </div>
                              <div className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                                {driver.email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                                {driver.totalBuses || 0}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className={`text-sm ${darktheme ? "text-green-400" : "text-green-600"}`}>
                                {driver.activeBuses || 0}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                (driver.activeBuses || 0) > 0
                                  ? darktheme
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-green-100 text-green-800'
                                  : darktheme
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {(driver.activeBuses || 0) > 0 ? 'Active' : 'Inactive'}
                              </span>
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

          {/* Geospatial Analytics - Heatmaps */}
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-6 ${darktheme ? "text-white" : "text-gray-800"}`}>
              🌍 Geospatial Analytics
            </h2>
            
            {/* Heatmap Toggle Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveHeatmap('bus')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeHeatmap === 'bus'
                    ? darktheme
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : darktheme
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🚌 Bus Activity Heatmap
              </button>
              <button
                onClick={() => setActiveHeatmap('ticket')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeHeatmap === 'ticket'
                    ? darktheme
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                    : darktheme
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎫 Ticket Purchase Heatmap
              </button>
            </div>

            {/* Heatmap Card */}
            <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"}
            `}>
              <CardHeader>
                <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
                  {activeHeatmap === 'bus' 
                    ? '📊 Bus Activity Distribution' 
                    : '📊 Ticket Purchase Hotspots'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-xl overflow-hidden relative">
                  <MapContainer
                    center={[28.6139, 77.2090]} // Delhi coordinates
                    zoom={11}
                    style={{ height: '100%', width: '100%' }}
                    className="z-10"
                  >
                    <TileLayer
                      url={
                        darktheme
                          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      }
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Heatmap Overlay */}
                    <HeatmapLayer 
                      points={activeHeatmap === 'bus' ? busHeatmapData : ticketHeatmapData}
                      radius={25}
                      blur={15}
                      max={1.0}
                      gradient={{
                        0.0: darktheme ? '#1e3a8a' : '#3b82f6', // Blue for low intensity
                        0.5: darktheme ? '#c2410c' : '#f59e0b', // Orange for medium
                        1.0: darktheme ? '#dc2626' : '#ef4444'  // Red for high intensity
                      }}
                    />
                  </MapContainer>
                  
                  {/* Legend */}
                  <div className={`absolute bottom-4 left-4 p-4 rounded-xl backdrop-blur-sm ${
                    darktheme 
                      ? 'bg-gray-900/80 border border-gray-700' 
                      : 'bg-white/80 border border-gray-200'}
                  `}>
                    <h3 className={`font-semibold mb-2 ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                      Intensity Scale
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: darktheme ? '#1e3a8a' : '#3b82f6' }}></div>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: darktheme ? '#c2410c' : '#f59e0b' }}></div>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: darktheme ? '#dc2626' : '#ef4444' }}></div>
                      </div>
                      <div className="flex flex-col text-xs">
                        <span className={darktheme ? 'text-gray-300' : 'text-gray-600'}>Low</span>
                        <span className={darktheme ? 'text-gray-300' : 'text-gray-600'}>Medium</span>
                        <span className={darktheme ? 'text-gray-300' : 'text-gray-600'}>High</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Heatmap Info */}
                <div className={`mt-4 p-4 rounded-xl ${
                  darktheme ? 'bg-gray-700/50' : 'bg-gray-100'}
                `}>
                  <p className={`text-sm ${darktheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    {activeHeatmap === 'bus' 
                      ? 'This heatmap shows bus activity concentration across different areas. Red areas indicate high bus traffic and frequent stops.'
                      : 'This heatmap shows where tickets are most frequently purchased. Red areas indicate popular pickup/drop-off points.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Metrics Table */}
          <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/90 border-white/50"}
          `}>
            <CardHeader>
              <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
                📊 Detailed Revenue Metrics (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyStats.length === 0 ? (
                <div className={`text-center py-4 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                  No revenue data available
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
                          Revenue
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Tickets Sold
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Unique Users
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                          Avg Ticket Price
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
                            <div className={`text-sm font-semibold ${darktheme ? "text-green-400" : "text-green-600"}`}>
                              ${day.totalEarnings?.toFixed(2) || '0.00'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${darktheme ? "text-blue-400" : "text-blue-600"}`}>
                              {day.totalTickets || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${darktheme ? "text-purple-400" : "text-purple-600"}`}>
                              {day.uniqueUsersCount || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${darktheme ? "text-yellow-400" : "text-yellow-600"}`}>
                              ${(day.totalTickets > 0 ? (day.totalEarnings || 0) / day.totalTickets : 0).toFixed(2) || '0.00'}
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

// Heatmap Layer Component
const HeatmapLayer = ({ points, radius, blur, max, gradient }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    
    // Create heatmap layer
    const heatLayer = L.heatLayer(points, {
      radius: radius || 25,
      blur: blur || 15,
      max: max || 1.0,
      gradient: gradient || {
        0.0: '#0000ff', // Blue
        0.5: '#ffff00', // Yellow
        1.0: '#ff0000'  // Red
      }
    });
    
    // Add to map
    heatLayer.addTo(map);
    
    // Cleanup
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, radius, blur, max, gradient]);
  
  return null; // This component doesn't render anything directly
};

export default AdminAnalytics;