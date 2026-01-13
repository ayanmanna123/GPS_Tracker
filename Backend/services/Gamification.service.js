import Reward from '../models/Reward.model.js';

class GamificationService {
  static calculateCarbonFootprintSaved(distanceInKm) {
    // Average car emits ~120g CO2/km per passenger
    // Average bus emits ~82g CO2/km per passenger (when 30% occupancy)
    // So switching from car to bus saves ~38g CO2/km per passenger
    const co2SavedPerKm = 0.038; // kg CO2 saved per km
    return distanceInKm * co2SavedPerKm;
  }

  static assignPoints(tripDistance) {
    // Assign points based on trip distance (1 point per km)
    return Math.round(tripDistance);
  }

  static async assignBadges(userId, newTripData = {}) {
    try {
      const rewardProfile = await Reward.findOne({ userId });
      if (!rewardProfile) return [];

      const badges = [...rewardProfile.badges];
      const achievements = rewardProfile.achievements || [];
      
      // Check for frequent rider badge (10 trips)
      if (rewardProfile.totalTrips >= 10 && !badges.includes('frequent-rider')) {
        badges.push('frequent-rider');
      }

      // Check for route explorer badge (visited 5 different routes)
      const uniqueRoutes = new Set(achievements
        .filter(a => a.name === 'explore-new-routes')
        .map(a => a.progress?.current));
      if (uniqueRoutes.size >= 5 && !badges.includes('route-explorer')) {
        badges.push('route-explorer');
      }

      // Check for eco-friendly traveler badge (saved 10kg+ CO2)
      if (rewardProfile.carbonFootprintSaved >= 10 && !badges.includes('eco-friendly-traveler')) {
        badges.push('eco-friendly-traveler');
      }

      // Check for early adopter badge (one of first 100 users)
      if (rewardProfile.createdAt && new Date(rewardProfile.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        // If account was created more than 30 days ago
        if (!badges.includes('early-adopter')) {
          badges.push('early-adopter');
        }
      }

      // Check for community champion badge (high engagement)
      if (rewardProfile.points > 500 && !badges.includes('community-champion')) {
        badges.push('community-champion');
      }

      return badges;
    } catch (error) {
      console.error('Error assigning badges:', error);
      return [];
    }
  }

  static async updateAchievements(userId, tripData) {
    try {
      const rewardProfile = await Reward.findOne({ userId });
      if (!rewardProfile) return [];

      let updatedAchievements = [...rewardProfile.achievements] || [];

      // Update or create explore new routes achievement
      const routeExplorerIndex = updatedAchievements.findIndex(a => a.name === 'explore-new-routes');
      if (routeExplorerIndex !== -1) {
        updatedAchievements[routeExplorerIndex].progress.current += 1;
      } else {
        updatedAchievements.push({
          name: 'explore-new-routes',
          description: 'Explore 10 different routes',
          progress: { current: 1, target: 10 },
          earnedDate: null
        });
      }

      // Update or create frequent rider achievement
      const frequentRiderIndex = updatedAchievements.findIndex(a => a.name === 'frequent-rider');
      if (frequentRiderIndex !== -1) {
        updatedAchievements[frequentRiderIndex].progress.current += 1;
      } else {
        updatedAchievements.push({
          name: 'frequent-rider',
          description: 'Take 50 trips',
          progress: { current: 1, target: 50 },
          earnedDate: null
        });
      }

      // Update or create eco-warrior achievement
      const ecoWarriorIndex = updatedAchievements.findIndex(a => a.name === 'eco-warrior');
      if (ecoWarriorIndex !== -1) {
        updatedAchievements[ecoWarriorIndex].progress.current = rewardProfile.carbonFootprintSaved;
      } else {
        updatedAchievements.push({
          name: 'eco-warrior',
          description: 'Save 25kg of CO2 emissions',
          progress: { current: rewardProfile.carbonFootprintSaved, target: 25 },
          earnedDate: null
        });
      }

      // Update achievements and check if any are completed
      updatedAchievements = updatedAchievements.map(achievement => {
        if (achievement.progress.current >= achievement.progress.target && !achievement.earnedDate) {
          achievement.earnedDate = new Date();
        }
        return achievement;
      });

      return updatedAchievements;
    } catch (error) {
      console.error('Error updating achievements:', error);
      return [];
    }
  }

  static async checkCommunityChallenges(userId) {
    try {
      // Get all users sorted by points to determine top performers
      const allUsers = await Reward.find({})
        .sort({ points: -1 })
        .select('userId points totalTrips');

      const userIndex = allUsers.findIndex(reward => 
        reward.userId.toString() === userId.toString()
      );

      // Define community challenges
      const communityChallenges = [
        {
          name: 'Monthly Top 10',
          description: 'Be in the top 10 users by points this month',
          participants: allUsers.slice(0, 10),
          isActive: true
        },
        {
          name: 'Most Trips',
          description: 'Take the most trips in the last 30 days',
          participants: allUsers.sort((a, b) => b.totalTrips - a.totalTrips).slice(0, 10),
          isActive: true
        },
        {
          name: 'Eco Champion',
          description: 'Save the most CO2 emissions in the last 30 days',
          participants: allUsers.sort((a, b) => b.carbonFootprintSaved - a.carbonFootprintSaved).slice(0, 10),
          isActive: true
        }
      ];

      // Check if user is participating in any challenge
      const userChallenges = communityChallenges.filter(challenge => 
        challenge.participants.some(participant => participant.userId.toString() === userId.toString())
      );

      return userChallenges;
    } catch (error) {
      console.error('Error checking community challenges:', error);
      return [];
    }
  }
}
export default GamificationService;