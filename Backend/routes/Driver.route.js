import express from "express";
import { isAuthenticated, attachUser, checkRole } from "../middleware/auth.js";
import { turnstileMiddleware } from "../middleware/turnstileMiddleware.js";
import {
  createDriver,
  DriverCreateBus,
  updateProfile,
  userFindByEmail,
} from "../controllers/Driver.controller.js";

const driverRoute = express.Router();

/* ===========================
   DRIVER ROUTES
=========================== */

/**
 * Create driver
 * 👉 ADMIN / MODERATOR only
 */
driverRoute.post(
  "/create",
  isAuthenticated,
  attachUser,
  checkRole("admin", "moderator"),
  turnstileMiddleware,
  createDriver
);

/**
 * Verify driver by email
 * 👉 Public
 */
driverRoute.get(
  "/verify/email/:email",
  userFindByEmail
);

/**
 * Update driver profile
 * 👉 DRIVER (user) himself OR ADMIN
 */
driverRoute.put(
  "/update/profile",
  isAuthenticated,
  attachUser,
  checkRole("admin", "user"),
  updateProfile
);

/**
 * Create / view buses by driver
 * 👉 DRIVER + ADMIN
 */
driverRoute.get(
  "/allBus",
  isAuthenticated,
  attachUser,
  checkRole("admin", "user"),
  DriverCreateBus
);

export default driverRoute;
