import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  updateTrackingData,
  getEnhancedTrackingInfo,
  getMultipleBusTracking,
  shareBusLocation,
  updatePassengerCount,
  calculateETA,
} from "../controllers/EnhancedTracking.controller.js";

const enhancedTrackingRoute = express.Router();

// Update real-time tracking data (for bus/driver)
enhancedTrackingRoute.post(
  "/update-tracking",
  isAuthenticated,
  updateTrackingData
);

// Get enhanced tracking info for a specific bus (public)
enhancedTrackingRoute.get("/bus/:deviceID", getEnhancedTrackingInfo);

// Get tracking info for multiple buses (public)
enhancedTrackingRoute.post("/multiple-buses", getMultipleBusTracking);

// Share bus location with friends (protected)
enhancedTrackingRoute.post(
  "/share-location",
  isAuthenticated,
  shareBusLocation
);

// Update passenger count (for bus/driver)
enhancedTrackingRoute.post(
  "/passenger-count",
  isAuthenticated,
  updatePassengerCount
);

// Calculate ETA (public)
enhancedTrackingRoute.post("/calculate-eta", calculateETA);

export default enhancedTrackingRoute;
