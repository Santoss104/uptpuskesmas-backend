import dotenv from "dotenv";
dotenv.config({
  debug: false,
  override: false,
});

import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { app } from "./app";
import connectDB from "./utils/db";
import { closeRedisConnection } from "./utils/redis";

// Production enhancements
import { validateEnvironment } from "./utils/envValidator";
import logger from "./utils/logger";

const env = validateEnvironment();

const serverRequiredVars = ["ACCESS_TOKEN", "REFRESH_TOKEN"];
const missingServerVars = serverRequiredVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingServerVars.length > 0) {
  logger.error(
    `Missing required server environment variables: ${missingServerVars.join(
      ", "
    )}`
  );
  process.exit(1);
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUD_API_KEY,
  api_secret: env.CLOUD_SECRET_KEY,
});

// Test Cloudinary connection
const testCloudinaryConnection = async (): Promise<void> => {
  try {
    await cloudinary.api.ping();
    logger.info("Cloudinary connected successfully");
  } catch (error) {
    logger.warn("Cloudinary connection failed", {
      error: (error as Error).message,
      note: "Image upload features may not work properly",
    });
  }
};

const PORT = process.env.PORT || 5000;
const NODE_ENV = env.NODE_ENV;

let server: any;

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Database connection
    await connectDB();
    logger.info("Database connected successfully");

    // Cloudinary connection test
    await testCloudinaryConnection();

    // Start HTTP server
    server = app.listen(PORT, () => {
      const startupInfo = {
        port: PORT,
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        ...(NODE_ENV === "development" && {
          processId: process.pid,
          nodeVersion: process.version,
        }),
      };

      logger.info("Server started successfully", startupInfo);

      if (NODE_ENV === "development") {
        console.log(`
╭─────────────────────────────────────╮
│  🚀 Server is running successfully! │
├─────────────────────────────────────┤
│  🔊 Port: ${PORT.toString().padEnd(26)}│
│  🌍 Environment: ${NODE_ENV.padEnd(19)}│
│  📅 Started: ${new Date().toLocaleString().padEnd(20)}   │
│  🆔 Process ID: ${process.pid.toString().padEnd(20)}│
│  📚 Node Version: ${process.version.padEnd(18)}│
╰─────────────────────────────────────╯
        `);
      } else {
        console.log(`✅ Server started on port ${PORT} (${NODE_ENV})`);
      }
    });

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error("Server error occurred", {
          error: error.message,
          stack: error.stack,
        });
        process.exit(1);
      }
    });

    // Handle server timeout
    server.timeout = 30000; // 30 seconds timeout
  } catch (error) {
    logger.error("Failed to start server", {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error("Graceful shutdown timeout (30s), forcing shutdown...");
    process.exit(1);
  }, 30000);

  try {
    if (server) {
      server.close(async (err: any) => {
        if (err) {
          logger.error("Error closing HTTP server", { error: err.message });
        } else {
          logger.info("HTTP server closed successfully");
        }
      });

      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    }

    // Close Redis connection
    try {
      await closeRedisConnection();
      logger.info("Redis connection closed successfully");
    } catch (redisError) {
      logger.error("Error closing Redis connection", {
        error: (redisError as Error).message,
      });
    }

    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info("Database connection closed successfully");
    }

    clearTimeout(shutdownTimeout);
    logger.info("Graceful shutdown completed successfully");
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);
    logger.error("Error during graceful shutdown", {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason: unknown, promise: Promise<any>) => {
  logger.error("Unhandled Promise Rejection detected", {
    reason: reason,
    promise: promise.toString(),
    stack: reason instanceof Error ? reason.stack : undefined,
  });

  if (NODE_ENV === "production") {
    logger.info("Initiating graceful shutdown due to unhandled rejection...");
    gracefulShutdown("unhandledRejection");
  }
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception detected", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  logger.error("Process will exit due to uncaught exception");

  if (NODE_ENV === "production") {
    setTimeout(() => {
      process.exit(1);
    }, 5000); // Give 5 seconds for cleanup
    gracefulShutdown("uncaughtException");
  } else {
    process.exit(1);
  }
});

// Shutdown signal handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

if (process.platform === "win32") {
  process.on("SIGBREAK", () => gracefulShutdown("SIGBREAK"));
}

process.on("warning", (warning) => {
  logger.warn("Process warning", {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
  });
});

// Start the server
startServer().catch((error) => {
  logger.error("Failed to start application", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

if (NODE_ENV === "development") {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const formatBytes = (bytes: number) =>
      Math.round((bytes / 1024 / 1024) * 100) / 100;

    const memoryInfo = {
      rss: formatBytes(memUsage.rss),
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      external: formatBytes(memUsage.external),
    };

    logger.debug("Memory usage", memoryInfo);

    if (memUsage.heapUsed > 150 * 1024 * 1024) {
      // 150MB threshold
      logger.warn("High memory usage detected", memoryInfo);
    }
  }, 300000); // Every 5 minutes
} else if (NODE_ENV === "production") {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const formatBytes = (bytes: number) =>
      Math.round((bytes / 1024 / 1024) * 100) / 100;

    if (memUsage.heapUsed > 200 * 1024 * 1024) {
      // 200MB threshold for production
      logger.warn("High memory usage in production", {
        rss: formatBytes(memUsage.rss) + "MB",
        heapUsed: formatBytes(memUsage.heapUsed) + "MB",
        heapTotal: formatBytes(memUsage.heapTotal) + "MB",
      });
    }
  }, 600000); // Every 10 minutes in production
}

if (NODE_ENV === "production") {
  setInterval(() => {
    const cpuUsage = process.cpuUsage();
    logger.debug("CPU usage", {
      user: cpuUsage.user,
      system: cpuUsage.system,
    });
  }, 300000); // Every 5 minutes
}

export { server };
