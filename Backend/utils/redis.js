import { createClient } from "redis";

let redisClient = null;
let isConnected = false;
let connectionAttempted = false;

/**
 * Initialize Redis client with graceful error handling
 * If Redis is not available, the application will continue to work
 * without caching functionality
 */
const initRedis = async () => {
  if (connectionAttempted) return; // Only try once
  connectionAttempted = true;

  const redisUri = process.env.REDIS_URI || "redis://localhost:6379";

  try {
    redisClient = createClient({
      url: redisUri,
      socket: {
        connectTimeout: 3000, // 3 second timeout
        reconnectStrategy: (retries) => {
          // Stop reconnecting after 2 attempts
          if (retries > 2) {
            console.log("⚠️ Redis: Max reconnection attempts reached. Running without cache.");
            return false;
          }
          return Math.min(retries * 100, 1000);
        },
      },
    });

    redisClient.on("connect", () => {
      console.log("✅ Connected to Redis");
      isConnected = true;
    });

    redisClient.on("error", (err) => {
      // Only log the first error, suppress repeated connection errors
      if (isConnected || !connectionAttempted) {
        console.error("❌ Redis Error:", err.message);
      }
      isConnected = false;
    });

    redisClient.on("end", () => {
      isConnected = false;
    });

    await redisClient.connect();
  } catch (error) {
    console.warn("⚠️ Redis not available. Running without caching.");
    isConnected = false;
    redisClient = null;
  }
};

// Initialize Redis (non-blocking)
initRedis().catch(() => {
  console.warn("⚠️ Redis initialization skipped.");
});

/**
 * Wrapper for Redis get operation with fallback
 */
const get = async (key) => {
  if (!isConnected || !redisClient) {
    return null;
  }
  try {
    return await redisClient.get(key);
  } catch (error) {
    return null;
  }
};

/**
 * Wrapper for Redis setEx operation with fallback
 */
const setEx = async (key, seconds, value) => {
  if (!isConnected || !redisClient) {
    return false;
  }
  try {
    await redisClient.setEx(key, seconds, value);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Wrapper for Redis del operation with fallback
 */
const del = async (key) => {
  if (!isConnected || !redisClient) {
    return false;
  }
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => isConnected;

// Export a wrapper object with graceful fallbacks
export default {
  get,
  setEx,
  del,
  isConnected: isRedisConnected,
  client: () => redisClient,
};
