import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { turnstileMiddleware } from "../middleware/turnstileMiddleware.js";

import { CreateBus, getAllBUs, getAvailableSeats, createBooking, cancelBooking, getUserBookings } from "../controllers/Bus.controller.js";
import {
  calculateTicketPrice,
  createTickete,
  findTicketById,
  getTecket,
  veryfypament,
} from "../controllers/TecketPriceCalculator.controller.js";

const BusRoute = express.Router();

// Only admin/driver creates bus → human + auth
BusRoute.post("/createbus", turnstileMiddleware, isAuthenticated, CreateBus);

// Public route, no CAPTCHA needed
BusRoute.get("/get/allBus", getAllBUs);

// Price calculation can be public or protected (your choice)
BusRoute.post("/calculate/price", calculateTicketPrice);

// Payment verification must be protected
BusRoute.post("/verify-payment", isAuthenticated, veryfypament);

// User ticket routes
BusRoute.get("/user/all-ticket", isAuthenticated, getTecket);
BusRoute.get("/get-ticket/:ticketid", isAuthenticated, findTicketById);

// Creating order must be human + authenticated
BusRoute.post(
  "/create-order",
  turnstileMiddleware,
  isAuthenticated,
  createTickete,
);

// Booking routes
BusRoute.get("/available-seats/:busId/:journeyDate", isAuthenticated, getAvailableSeats);
BusRoute.post("/booking", turnstileMiddleware, isAuthenticated, createBooking);
BusRoute.delete("/booking/:bookingId", isAuthenticated, cancelBooking);
BusRoute.get("/user/bookings", isAuthenticated, getUserBookings);

export default BusRoute;
