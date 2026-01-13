import Reward from '../models/Reward.model.js';
import User from '../models/User.model.js';
import GamificationService from '../services/Gamification.service.js';

export const getRewards = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated
    
    let rewardProfile = await Reward.findOne({ userId });
    
    if (!rewardProfile) {
      // Create a new reward profile if it doesn't exist
      rewardProfile = await Reward.create({ userId });
    }
    
    res.status(200).json({
      success: true,
      data: rewardProfile
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards'
    });
  }
};

export const updateRewardsForTrip = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tripDistance, routeId, destination } = req.body;

    if (!tripDistance || !routeId) {
      return res.status(400).json({
        success: false,
        message: 'Trip distance and route ID are required'
      });
    }

    // Calculate points and carbon savings using the service
    const pointsEarned = GamificationService.assignPoints(tripDistance);
    const carbonSaved = GamificationService.calculateCarbonFootprintSaved(tripDistance);

    // Find or create reward profile
    let rewardProfile = await Reward.findOne({ userId });
    
    if (!rewardProfile) {
      rewardProfile = await Reward.create({
        userId,
        points: pointsEarned,
        carbonFootprintSaved: carbonSaved,
        totalTrips: 1
      });
    } else {
      // Update existing profile
      rewardProfile.points += pointsEarned;
      rewardProfile.carbonFootprintSaved += carbonSaved;
      rewardProfile.totalTrips += 1;

      // Update achievements using the service
      rewardProfile.achievements = await GamificationService.updateAchievements(userId, { routeId, tripDistance });

      // Assign new badges based on updated stats using the service
      const newBadges = await GamificationService.assignBadges(userId, { routeId });
      rewardProfile.badges = [...new Set([...rewardProfile.badges, ...newBadges])];

      await rewardProfile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Rewards updated successfully',
      data: rewardProfile
    });
  } catch (error) {
    console.error('Error updating rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rewards'
    });
  }
};

export const getAllRewardsLeaderboard = async (req, res) => {
  try {
    const { sortBy = 'points', limit = 20 } = req.query;
    
    const validSortFields = ['points', 'totalTrips', 'carbonFootprintSaved'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'points';
    
    const leaderboard = await Reward.find({})
      .populate('userId', 'name email profilePicture')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

export const getUserRank = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all users sorted by points
    const allUsers = await Reward.find({})
      .sort({ points: -1 })
      .select('userId points');
    
    const userIndex = allUsers.findIndex(reward => 
      reward.userId.toString() === userId.toString()
    );
    
    const rank = userIndex !== -1 ? userIndex + 1 : -1;

    res.status(200).json({
      success: true,
      data: {
        rank,
        totalUsers: allUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank'
    });
  }
};

// New endpoint for community challenges
export const getCommunityChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const challenges = await GamificationService.checkCommunityChallenges(userId);

    res.status(200).json({
      success: true,
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching community challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community challenges'
    });
  }
};