import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { createUser } from "../controllers/User.controller.js";

const UserRoute = express.Router();

UserRoute.post("/crete/User", isAuthenticated, createUser);

export default UserRoute;
