import express from "express";
import {
    predictETA,
    predictOptimalRoute,
    getDelayPrediction,
    getRouteReliability,
    submitPredictionFeedback,
    getPredictionStats,
} from "../controllers/RoutePrediction.controller.js";

const router = express.Router();

/**
 * @route   GET /api/v1/predict/eta
 * @desc    Get ETA prediction for a bus at a specific location
 * @query   busId (required), stopId (optional), lat (optional), lng (optional)
 * @access  Public
 */
router.get("/eta", predictETA);

/**
 * @route   GET /api/v1/predict/route
 * @desc    Get optimal route prediction between two locations
 * @query   fromLat, fromLng, toLat, toLng (all required)
 * @access  Public
 */
router.get("/route", predictOptimalRoute);

/**
 * @route   GET /api/v1/predict/delays/:routeId
 * @desc    Get delay prediction for a specific route
 * @params  routeId (required)
 * @access  Public
 */
router.get("/delays/:routeId", getDelayPrediction);

/**
 * @route   GET /api/v1/predict/reliability/:routeId
 * @desc    Get route reliability score based on historical data
 * @params  routeId (required)
 * @query   days (optional, default: 30)
 * @access  Public
 */
router.get("/reliability/:routeId", getRouteReliability);

/**
 * @route   POST /api/v1/predict/feedback
 * @desc    Submit feedback to improve prediction accuracy
 * @body    { busId, routeId, predictedMinutes, actualMinutes, conditions }
 * @access  Public
 */
router.post("/feedback", submitPredictionFeedback);

/**
 * @route   GET /api/v1/predict/stats
 * @desc    Get prediction model statistics and info
 * @access  Public
 */
router.get("/stats", getPredictionStats);

export default router;
