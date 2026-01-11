import express from "express";
import { isAuthenticated, attachUser, checkRole } from "../middleware/auth.js";
import { turnstileMiddleware } from "../middleware/turnstileMiddleware.js";

import { CreateBus, getAllBUs } from "../controllers/Bus.controller.js";
import {
  calculateTicketPrice,
  createTickete,
  findTicketById,
  getTecket,
  veryfypament,
} from "../controllers/TecketPriceCalculator.controller.js";

const BusRoute = express.Router();

/* ===========================
   BUS MANAGEMENT (ADMIN)
=========================== */

/**
 * Create bus
 * 👉 ADMIN only + human verified
 */
BusRoute.post(
  "/createbus",
  isAuthenticated,
  attachUser,
  checkRole("admin"),
  turnstileMiddleware,
  CreateBus
);

/**
 * Get all buses
 * 👉 Public
 */
BusRoute.get(
  "/get/allBus",
  getAllBUs
);

/* ===========================
   TICKETS & PAYMENTS
=========================== */

/**
 * Calculate ticket price
 * 👉 Public
 */
BusRoute.post(
  "/calculate/price",
  calculateTicketPrice
);

/**
 * Verify payment
 * 👉 AUTHENTICATED USER
 */
BusRoute.post(
  "/verify-payment",
  isAuthenticated,
  attachUser,
  checkRole("user", "admin"),
  veryfypament
);

/**
 * Get all tickets of logged-in user
 * 👉 USER / ADMIN
 */
BusRoute.get(
  "/user/all-ticket",
  isAuthenticated,
  attachUser,
  checkRole("user", "admin"),
  getTecket
);

/**
 * Get ticket by ID
 * 👉 USER / ADMIN
 */
BusRoute.get(
  "/get-ticket/:ticketid",
  isAuthenticated,
  attachUser,
  checkRole("user", "admin"),
  findTicketById
);

/**
 * Create ticket order
 * 👉 USER only + human verified
 */
BusRoute.post(
  "/create-order",
  isAuthenticated,
  attachUser,
  checkRole("user"),
  turnstileMiddleware,
  createTickete
);

export default BusRoute;
