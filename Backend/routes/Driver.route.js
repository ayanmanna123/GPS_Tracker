import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { turnstileMiddleware } from "../middleware/turnstileMiddleware.js";
import {
  createDriver,
  DriverCreateBus,
  updateProfile,
  userFindByEmail,
} from "../controllers/Driver.controller.js";

const driverRoute = express.Router();

// Protected + Human verified
driverRoute.post("/createUser", isAuthenticated, createDriver);

// Public (no captcha needed usually)
driverRoute.get("/veryfi/email/:email", userFindByEmail);

// Protected + Human verified
driverRoute.put("/update/profile", isAuthenticated, updateProfile);
driverRoute.get("/allBus", isAuthenticated, DriverCreateBus);

export default driverRoute;
