import express from "express";
import { createFeedback, getFeedbacks } from "../controllers/Feedback.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const FeedbackRoute = express.Router();

// Passenger submits feedback
FeedbackRoute.post("/feedbacks", isAuthenticated, createFeedback);

// Admin fetches feedbacks (filterable, paginated)
FeedbackRoute.get("/feedbacks", isAuthenticated, getFeedbacks);

export default FeedbackRoute;
