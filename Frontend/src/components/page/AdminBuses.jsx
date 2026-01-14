import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

const AdminBuses = () => {
  const { getAccessTokenSilently, user, isLoading } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: 'http://localhost:5000/api/v3',
        });
        
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/buses?page=${currentPage}&limit=10`, 
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setBuses(res.data.data.buses);
          setPagination(res.data.data.pagination);
        } else {
          throw new Error(res.data.message || 'Error fetching buses');
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err.message;
        setError(msg);
        console.error('Error fetching buses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchBuses();
    }
  }, [getAccessTokenSilently, user, isLoading, currentPage]);

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
          <h1 className="text-3xl font-bold text-gray-800">Manage Buses</h1>
          <p className="text-gray-600">View and manage all registered buses</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Bus Management</CardTitle>
          </CardHeader>
          <CardContent>
            {buses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No buses found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {buses.map((busData) => (
                      <tr key={busData._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{busData.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{busData.deviceID}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{busData.driver?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{busData.driver?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {busData.from} → {busData.to}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {busData.capacity?.availableSeats || 0}/{busData.capacity?.totalSeats || 0} seats
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${busData.ticketprice || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(busData.createdAt).toLocaleDateString()}
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
                    {Math.min(currentPage * 10, pagination.totalBuses)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalBuses}</span> results
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

export default AdminBuses;