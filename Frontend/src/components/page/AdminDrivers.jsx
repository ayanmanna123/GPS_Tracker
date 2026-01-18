import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import Navbar from '../shared/Navbar';

const AdminDrivers = () => {
  const { getAccessTokenSilently, user, isLoading } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: 'http://localhost:5000/api/v3',
        });
        
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/drivers?page=${currentPage}&limit=10`, 
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setDrivers(res.data.data.drivers);
          setPagination(res.data.data.pagination);
        } else {
          throw new Error(res.data.message || 'Error fetching drivers');
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err.message;
        setError(msg);
        console.error('Error fetching drivers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchDrivers();
    }
  }, [getAccessTokenSilently, user, isLoading, currentPage]);

  const { darktheme } = useSelector((store) => store.auth);

  const updateDriverStatus = async (driverId, newStatus) => {
    try {
      const token = await getAccessTokenSilently({
        audience: 'http://localhost:5000/api/v3',
      });
      
      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/admin/drivers/${driverId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        // Update the driver in the local state
        setDrivers(prevDrivers =>
          prevDrivers.map(d => 
            d._id === driverId ? { ...d, status: newStatus } : d
          )
        );
        alert('Driver status updated successfully');
      } else {
        throw new Error(res.data.message || 'Error updating driver status');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      console.error('Error updating driver status:', err);
      alert('Error updating driver status: ' + msg);
    }
  };

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
            <h1 className={`text-3xl font-bold ${darktheme ? "text-white" : "text-gray-800"}`}>Manage Drivers</h1>
            <p className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}>View and manage all registered drivers</p>
          </div>

        <Card className={`shadow-xl rounded-2xl border backdrop-blur-sm ${darktheme
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/90 border-white/50"}`}>
          <CardHeader>
            <CardTitle className={`${darktheme ? "text-white" : "text-gray-800"}`}>
              Driver Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drivers.length === 0 ? (
              <div className={`text-center py-8 ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                No drivers found
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${darktheme ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Email
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        License ID
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Experience
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Joined Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darktheme ? "text-gray-300" : "text-gray-500"}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darktheme ? "divide-gray-700" : "divide-gray-200"}`}>
                    {drivers.map((driverData) => (
                      <tr key={driverData._id} className={`${darktheme ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {driverData.picture ? (
                                <img className="h-10 w-10 rounded-full" src={driverData.picture} alt="" />
                              ) : (
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${darktheme ? "bg-gray-700" : "bg-gray-200"}`}>
                                  <span className={`${darktheme ? "text-gray-300" : "text-gray-600"}`}>
                                    {driverData.name?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${darktheme ? "text-white" : "text-gray-900"}`}>
                                {driverData.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {driverData.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-900"}`}>
                            {driverData.licenceId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={`${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                            {driverData.driverExp || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driverData.status === 'active' 
                              ? darktheme
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-green-100 text-green-800'
                              : darktheme
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {driverData.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={`${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                            {new Date(driverData.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            {driverData.status !== 'active' ? (
                              <button
                                onClick={() => updateDriverStatus(driverData._id, 'active')}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${darktheme
                                  ? "text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-100"}`}
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => updateDriverStatus(driverData._id, 'inactive')}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${darktheme
                                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  : "text-red-600 hover:text-red-700 hover:bg-red-100"}`}
                              >
                                Deactivate
                              </button>
                            )}
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
                    {Math.min(currentPage * 10, pagination.totalDrivers)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalDrivers}</span> results
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

export default AdminDrivers;