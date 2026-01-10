import { connect } from "mongoose";
import dotenv from "dotenv";
import { setOfflineMode } from "./mockData.js";

dotenv.config();

let isConnected = false;

const connectToMongo = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri === "undefined" || mongoUri.includes("<")) {
    console.warn("⚠️ MONGO_URI not configured. Running in OFFLINE MODE with mock data.");
    setOfflineMode(true);
    return false;
  }

  try {
    await connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000,
    });
    console.log("✅ Connected to MongoDB successfully");
    isConnected = true;
    setOfflineMode(false);
    return true;
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed. Running in OFFLINE MODE with mock data.");
    console.warn("   Error:", error.message);
    setOfflineMode(true);
    isConnected = false;
    return false;
  }
};

export const isMongoConnected = () => isConnected;

export default connectToMongo;
