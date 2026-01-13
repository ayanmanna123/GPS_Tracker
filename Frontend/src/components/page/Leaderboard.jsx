import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { toast } from 'sonner';

const Leaderboard = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('points');
  const [timeFrame, setTimeFrame] = useState('overall');

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboard();
      fetchUserRank();
    }
  }, [sortBy, isAuthenticated]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rewards/leaderboard?sortBy=${sortBy}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setLeaderboard(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while fetching leaderboard';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rewards/rank`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setUserRank(response.data.data);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while fetching user rank';
      toast.error(errorMessage);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getStatLabel = () => {
    switch (sortBy) {
      case 'totalTrips':
        return 'Trips';
      case 'carbonFootprintSaved':
        return 'CO₂ Saved (kg)';
      default:
        return 'Points';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Community Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-300">See how you rank among fellow eco-conscious travelers</p>
        </div>

        {/* User Rank Card */}
        {userRank && userRank.rank !== -1 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-8 text-center">
            <div className="text-2xl font-bold">Your Rank</div>
            <div className="text-4xl font-bold mt-2">{getRankIcon(userRank.rank)}</div>
            <div className="text-lg mt-1">out of {userRank.totalUsers} users</div>
            <div className="mt-3 text-blue-100">Keep traveling to climb higher!</div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="points">Points</option>
              <option value="totalTrips">Total Trips</option>
              <option value="carbonFootprintSaved">CO₂ Saved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Frame</label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="overall">Overall</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-3">Stat ({getStatLabel()})</div>
            <div className="col-span-3">Actions</div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const user = entry.userId;
              const statValue = entry[sortBy];
              
              return (
                <div key={entry._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="col-span-1 font-medium">
                    <span className={`${rank <= 3 ? (rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-amber-700') : 'text-gray-600 dark:text-gray-300'}`}>
                      {getRankIcon(rank)}
                    </span>
                  </div>
                  
                  <div className="col-span-5 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || 'Anonymous User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Joined recently
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeof statValue === 'number' ? 
                        (sortBy === 'carbonFootprintSaved' ? statValue.toFixed(2) + ' kg' : Math.round(statValue)) 
                        : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full transition-colors">
                      Send Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {leaderboard.reduce((sum, entry) => sum + (entry.points || 0), 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-300 mt-1">Total Points</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {leaderboard.reduce((sum, entry) => sum + (entry.totalTrips || 0), 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-300 mt-1">Total Trips</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {leaderboard.reduce((sum, entry) => sum + (entry.carbonFootprintSaved || 0), 0).toFixed(2)} kg
            </div>
            <div className="text-gray-600 dark:text-gray-300 mt-1">CO₂ Saved</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;