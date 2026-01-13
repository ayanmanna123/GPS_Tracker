import express from "express";
const router = express.Router();
import {
  planJourney,
  getTransferPoints,
  getWalkingRoute,
} from "../controllers/Journey.controller.js";
const JourneyRoute = express.Router();
// Journey planning endpoint
JourneyRoute.post("/journey-planner", planJourney);

// Transfer points endpoint
JourneyRoute.get("/transfer-points", getTransferPoints);

// Walking route endpoint
JourneyRoute.post("/walking-route", getWalkingRoute);

export default JourneyRoute;
