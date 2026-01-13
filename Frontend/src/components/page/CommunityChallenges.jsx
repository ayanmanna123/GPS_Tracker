import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { toast } from 'sonner';

const CommunityChallenges = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChallenges();
    }
  }, [isAuthenticated]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rewards/challenges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setChallenges(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch challenges');
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while fetching challenges';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sampleChallenges = [
    {
      name: 'Monthly Top 10',
      description: 'Be in the top 10 users by points this month',
      progress: { current: 3, target: 10 },
      endDate: '2024-01-31',
      isActive: true,
      participants: 150
    },
    {
      name: 'Most Trips',
      description: 'Take the most trips in the last 30 days',
      progress: { current: 15, target: 50 },
      endDate: '2024-01-31',
      isActive: true,
      participants: 89
    },
    {
      name: 'Eco Champion',
      description: 'Save the most CO2 emissions in the last 30 days',
      progress: { current: 12, target: 25 },
      endDate: '2024-01-31',
      isActive: true,
      participants: 67
    },
    {
      name: 'Route Explorer',
      description: 'Visit 10 different routes in 30 days',
      progress: { current: 7, target: 10 },
      endDate: '2024-01-31',
      isActive: true,
      participants: 42
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeChallenges = challenges.length > 0 ? challenges : sampleChallenges;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Community Challenges</h1>
          <p className="text-gray-600 dark:text-gray-300">Join exciting challenges and compete with other eco-conscious travelers</p>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold">{activeChallenges.length}</div>
            <div className="text-blue-100">Active Challenges</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold">1,247</div>
            <div className="text-green-100">Total Participants</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold">42</div>
            <div className="text-purple-100">Completed This Week</div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeChallenges.map((challenge, index) => {
            const progressPercentage = Math.min(100, (challenge.progress.current / challenge.progress.target) * 100);
            const isCompleted = challenge.progress.current >= challenge.progress.target;
            
            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 ${
                  isCompleted ? 'border-green-500' : challenge.isActive ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{challenge.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{challenge.description}</p>
                    </div>
                    {isCompleted ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed!</span>
                    ) : challenge.isActive ? (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Ended</span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>
                        Progress: {challenge.progress.current}/{challenge.progress.target}
                      </span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                    <span>{challenge.participants} participants</span>
                  </div>

                  {!isCompleted && challenge.isActive && (
                    <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                      Join Challenge
                    </button>
                  )}
                  
                  {isCompleted && (
                    <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors">
                      Claim Reward
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Challenges */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Challenges</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Exciting Challenges Coming Soon!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Stay tuned for seasonal challenges, holiday events, and special community competitions.
              </p>
              <button 
                onClick={fetchChallenges}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
              >
                Refresh Challenges
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChallenges;