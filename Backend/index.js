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
import supportBotRoutes from "./routes/supportBot.routes.js";
import { initSupportBot } from "./controllers/supportBot.controller.js";
dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;
// ✅ CORS Options
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://gps-map-nine.vercel.app",
    "https://gps-tracker-ecru.vercel.app",
  ],

  credentials: true,
};

app.use(cors(corsOptions));

app.get("/authorized", (req, res) => {
  res.send("Secured Resource");
});

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ✅ Public Test Route

app.use("/api/v1/Myroute", findBusRoute);
app.use("/api/v1", locationRoute);
app.use("/api/v1/driver", driverRoute);
app.use("/api/v1/Bus", BusRoute);
app.use("/api/v1/", JourneyRoute);
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/review", ReviewRoute);
app.use("/api/v1/support", supportBotRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from backend",
  });
});

app.listen(port, async () => {
  try {
    await initSupportBot();
  } catch (err) {
    console.error("⚠️ Support Bot initialization failed:", err.message);
  }
  console.log(`✅ Website is running at http://localhost:${port}`);
});
