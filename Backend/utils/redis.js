import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://localhost:6379",
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

// redisClient.on("error", (err) => {
//   console.error("❌ Redis Error:", err);
// });

try {
  await redisClient.connect();
} catch (err) {
  console.warn("⚠️ Redis connection failed. Using in-memory fallback (caching disabled).");

  // Mock Redis methods to prevent crashes
  const noop = async () => null;
  redisClient.get = noop;
  redisClient.set = noop;
  redisClient.setEx = noop;
  redisClient.del = noop;
}

export default redisClient;
