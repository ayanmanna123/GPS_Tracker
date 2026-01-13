import express from "express";
const router = express.Router();

import {
  getRewards,
  updateRewardsForTrip,
  getAllRewardsLeaderboard,
  getUserRank,
  getCommunityChallenges,
} from "../controllers/Reward.controller.js";

import isAuthenticated from "../middleware/isAuthenticated.js";
// Get user's rewards
router.get("/rewards", isAuthenticated, getRewards);

// Update rewards after a trip
router.post("/rewards/trip", isAuthenticated, updateRewardsForTrip);

// Get leaderboard
router.get("/leaderboard", getAllRewardsLeaderboard);

// Get user's rank
router.get("/rank", isAuthenticated, getUserRank);

// Get community challenges
router.get("/challenges", isAuthenticated, getCommunityChallenges);

export default router;
