import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = () => {
  if (process.env.REDIS_URI) {
    return process.env.REDIS_URI;
  }
  throw new Error("Redis connection failed");
};

export const redis = new Redis(redisClient());

// Add error handling
redis.on("error", (error: Error) => {
  console.error("❌ Redis connection error:", error.message);
});

redis.on("connect", () => {
  // Only log if verbose mode
  if (process.env.LOG_LEVEL === "verbose") {
    console.log("✅ Redis connected successfully");
  }
});

// Health check function for Redis
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
};

// shutdown function
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redis.quit();
    console.log("✅ Redis connection closed gracefully");
  } catch (error) {
    console.error("❌ Error closing Redis connection:", error);
    redis.disconnect();
  }
};
