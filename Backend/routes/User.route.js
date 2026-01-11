import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

import { createUser } from "../controllers/User.controller.js";

const UserRoute = express.Router();

/**
 * Create user (authenticated)
 */
UserRoute.post(
  "/create",
  isAuthenticated,
  createUser
);

export default UserRoute;
