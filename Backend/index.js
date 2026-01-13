import connectToMongo from "./utils/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import locationRoute from "./routes/location.route.js";
import cookieParser from "cookie-parser";
import driverRoute from "./routes/Driver.route.js";
import BusRoute from "./routes/bus.route.js";
import JourneyRoute from "./routes/journey.route.js";
import UserRoute from "./routes/User.route.js";
import findBusRoute from "./routes/MyLocation.route.js";
import ReviewRoute from "./routes/Review.route.js";
import feedbackRoute from "./routes/feedback.route.js";
import supportBotRoutes from "./routes/supportBot.routes.js";
import { initSupportBot } from "./controllers/supportBot.controller.js";
import email_route from "./routes/auth.routes.js";
import rateLimit from "express-rate-limit";

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

/* =========================
   RATE LIMITING CONFIGURATION
========================= */

// Global rate limiter - applies to all requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false,
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/signup requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes"
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Moderate rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    error: "Too many API requests, please slow down.",
    retryAfter: "1 minute"
  },
});

// Strict rate limiter for support/bot endpoints
const supportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: {
    error: "Too many support requests, please wait before trying again.",
    retryAfter: "1 minute"
  },
});

// Very strict limiter for email endpoints
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 email requests per hour
  message: {
    error: "Too many email requests, please try again later.",
    retryAfter: "1 hour"
  },
});

/* =========================
   API REQUEST LOGGING
========================= */
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    console.log(
      `[${method}] ${url} → ${status} (${duration}ms)`
    );
  });

  next();
});

/* =========================
   CORS CONFIGURATION
========================= */
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://gps-map-nine.vercel.app",
    "https://gps-tracker-ecru.vercel.app",
    "https://where-is-my-bus.netlify.app"
  ],
  credentials: true,
};

app.use(cors(corsOptions));

/* =========================
   BASIC ROUTES & MIDDLEWARES
========================= */
app.get("/authorized", (req, res) => {
  res.send("Secured Resource");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply global rate limiter to all routes
app.use(globalLimiter);

/* =========================
   API ROUTES WITH SPECIFIC RATE LIMITS
========================= */
app.use("/api/v1/Myroute", apiLimiter, findBusRoute);
app.use("/api/v1", apiLimiter, locationRoute);
app.use("/api/v1/driver", apiLimiter, driverRoute);
app.use("/api/v1/Bus", apiLimiter, BusRoute);
app.use("/api/v1/", apiLimiter, JourneyRoute);
app.use("/api/v1/user", authLimiter, UserRoute); // Stricter for user auth
app.use("/api/v1/review", apiLimiter, ReviewRoute);
app.use("/api/v1/support", supportLimiter, supportBotRoutes); // Stricter for support
app.use("/api/v1/email", emailLimiter, email_route); // Very strict for emails
app.use("/api/v1/feedback", apiLimiter, feedbackRoute);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from backend",
  });
});

/* =========================
   SERVER START
========================= */
app.listen(port, async () => {
  await initSupportBot();
  console.log(`✅ Website is running at http://localhost:${port}`);
});