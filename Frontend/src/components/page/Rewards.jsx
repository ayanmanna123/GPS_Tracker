import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { toast } from 'sonner';

const Rewards = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated) {
      fetchRewards();
    }
  }, [isAuthenticated]);

  const fetchRewards = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rewards/rewards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setRewards(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch rewards');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while fetching rewards';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">No rewards data available</h2>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { points, badges = [], achievements = [], totalTrips, carbonFootprintSaved } = rewards;

  // Badge icons mapping
  const badgeIcons = {
    'eco-friendly-traveler': '🌱',
    'route-explorer': '🗺️',
    'frequent-rider': '🚌',
    'early-adopter': '🚀',
    'community-champion': '🏆'
  };

  // Badge names mapping
  const badgeNames = {
    'eco-friendly-traveler': 'Eco-Friendly Traveler',
    'route-explorer': 'Route Explorer',
    'frequent-rider': 'Frequent Rider',
    'early-adopter': 'Early Adopter',
    'community-champion': 'Community Champion'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Rewards & Achievements</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your points, badges, and environmental impact</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {['overview', 'points', 'badges', 'achievements', 'impact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Points Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{points}</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Total Points</div>
            </div>

            {/* Trips Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalTrips}</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Total Trips</div>
            </div>

            {/* Badges Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{badges.length}</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Badges Earned</div>
            </div>

            {/* Carbon Saved Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {carbonFootprintSaved.toFixed(2)} kg
              </div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">CO₂ Saved</div>
            </div>
          </div>
        )}

        {/* Points Tab */}
        {activeTab === 'points' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Points</h2>
            <div className="text-center py-8">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">{points}</div>
              <div className="text-gray-600 dark:text-gray-300">Total Points Earned</div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Earn 1 point for every kilometer traveled. Points can be redeemed for exclusive benefits!
              </p>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Badges</h2>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="text-3xl mb-2">{badgeIcons[badge] || '🏅'}</div>
                    <div className="font-medium text-gray-800 dark:text-white text-sm text-center">
                      {badgeNames[badge] || badge}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">😢</div>
                <p className="text-gray-600 dark:text-gray-300">No badges earned yet</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Start exploring routes and taking trips to earn your first badge!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Achievements</h2>
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{achievement.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{achievement.description}</p>
                      </div>
                      {achievement.earnedDate && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Earned
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span>Progress: {achievement.progress?.current || 0}/{achievement.progress?.target || 0}</span>
                        <span>{Math.round(((achievement.progress?.current || 0) / (achievement.progress?.target || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, ((achievement.progress?.current || 0) / (achievement.progress?.target || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-gray-600 dark:text-gray-300">No achievements unlocked yet</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Complete challenges to unlock your first achievement!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Environmental Impact Tab */}
        {activeTab === 'impact' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Environmental Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="text-4xl mb-2">🌱</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {carbonFootprintSaved.toFixed(2)} kg
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-2">CO₂ Emissions Saved</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  By choosing public transport over private vehicles
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                <div className="text-4xl mb-2">🚌</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalTrips}</div>
                <div className="text-gray-600 dark:text-gray-300 mt-2">Total Trips Taken</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Making a positive impact with every journey
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Did you know?</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                On average, a full bus replaces about 40 cars on the road, reducing traffic congestion and air pollution. 
                By using public transport, you're contributing to cleaner air and a healthier planet!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;