import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

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
          <h1 className="text-3xl font-bold text-gray-800">Manage Drivers</h1>
          <p className="text-gray-600">View and manage all registered drivers</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Driver Management</CardTitle>
          </CardHeader>
          <CardContent>
            {drivers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No drivers found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driverData) => (
                      <tr key={driverData._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {driverData.picture ? (
                                <img className="h-10 w-10 rounded-full" src={driverData.picture} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600">
                                    {driverData.name?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{driverData.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{driverData.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{driverData.licenceId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driverData.driverExp || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driverData.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {driverData.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(driverData.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {driverData.status !== 'active' ? (
                              <button
                                onClick={() => updateDriverStatus(driverData._id, 'active')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => updateDriverStatus(driverData._id, 'inactive')}
                                className="text-red-600 hover:text-red-900"
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
                <div className="text-sm text-gray-700">
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
                    className={`px-4 py-2 border rounded-md ${
                      pagination.hasPrev
                        ? 'bg-white text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={!pagination.hasNext}
                    className={`px-4 py-2 border rounded-md ${
                      pagination.hasNext
                        ? 'bg-white text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
  );
};

export default AdminDrivers;