import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://localhost:6379",
});

let isRedisConnected = false;

redisClient.on("connect", () => {
  isRedisConnected = true;
  console.log("✅ Connected to Redis");
});

redisClient.on("error", (err) => {
  if (isRedisConnected) {
    console.error("❌ Redis Error:", err);
  }
  isRedisConnected = false;
});

try {
    await redisClient.connect();
} catch (err) {
    console.warn("⚠️ Redis connection failed. Application will run without caching.");
}

export default redisClient;
export { isRedisConnected };