// routes/busReviewRoutes.js
import express from "express";
import {
  createReview,
  getBusReviews,
  reportReview,
  markReviewHelpful,
  getBusReviewStats,
} from "../controllers/Review.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const ReviewRoute = express.Router();

// Create a new review (protected)
ReviewRoute.post("/reviews", isAuthenticated, createReview);

// Get all reviews for a specific bus (public)
ReviewRoute.get("/reviews/:busId", getBusReviews);

// Get review statistics for a bus (public)
ReviewRoute.get("/reviews/:busId/stats", getBusReviewStats);

// Report a review (protected)
ReviewRoute.post("/reviews/:reviewId/report", isAuthenticated, reportReview);

// Mark review as helpful (protected)
ReviewRoute.post(
  "/reviews/:reviewId/helpful",
  isAuthenticated,
  markReviewHelpful
);

export default ReviewRoute;
