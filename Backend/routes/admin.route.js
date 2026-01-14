import express from "express";
import isAdmin from "../middleware/isAdmin.js";
import {
  getAllUsers,
  getAllDrivers,
  getAllBuses,
  getAdminStats,
  getDriverStats,
  getUserTripStats,
  getDailyStats,
  updateUserStatus,
  updateDriverStatus,
} from "../controllers/Admin.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// Dashboard statistics
router.get("/stats", isAuthenticated, isAdmin, getAdminStats);

// User management
router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.patch(
  "/users/:userId/status",
  isAuthenticated,
  isAdmin,
  updateUserStatus
);

// Driver management
router.get("/drivers", isAuthenticated, isAdmin, getAllDrivers);
router.get("/driver-stats", isAuthenticated, isAdmin, getDriverStats);
router.patch(
  "/drivers/:driverId/status",
  isAuthenticated,
  isAdmin,
  updateDriverStatus
);

// Bus management
router.get("/buses", isAuthenticated, isAdmin, getAllBuses);

// Trip and revenue analytics
router.get("/user-trip-stats", isAuthenticated, isAdmin, getUserTripStats);
router.get("/daily-stats", isAuthenticated, isAdmin, getDailyStats);

export default router;
