import express from "express";
import { getRouteHistory, getAvailableDates } from "../controllers/RouteHistory.controller.js";

const router = express.Router();

// Get historical route data for a specific device
router.get("/:deviceID", getRouteHistory);

// Get available dates for route history
router.get("/:deviceID/dates", getAvailableDates);

export default router;