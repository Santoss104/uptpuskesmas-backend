import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Routes
import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import patientRouter from "./routes/patientRoute";
import patientsFromExcel from "./routes/patientExcelRoute";
import calendarRouter from "./routes/calendarRoute";

// Utils
import { checkRedisHealth } from "./utils/redis";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// Production enhancements
import logger from "./utils/logger";
import {
  metricsMiddleware,
  performanceMiddleware,
  requestIdMiddleware,
} from "./middleware/metrics";
import { ApiResponseHandler } from "./utils/apiResponse";

export const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Request ID middleware
app.use(requestIdMiddleware);

// Metrics and performance monitoring
app.use(metricsMiddleware);
app.use(performanceMiddleware);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Compression middleware
app.use(compression());

// Rate limiting with better error handling
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === "/health",
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("user-agent"),
      path: req.path,
      requestId: req.requestId,
    });

    return ApiResponseHandler.error(
      res,
      "Too many requests from this IP, please try again later.",
      429
    );
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn("Auth rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("user-agent"),
      requestId: req.requestId,
    });

    return ApiResponseHandler.error(
      res,
      "Too many authentication attempts, please try again later.",
      429
    );
  },
});

// Apply rate limiting
app.use("/api", limiter);
app.use("/api/v1/auth", authLimiter);

const bodyLimit = process.env.NODE_ENV === "production" ? "10mb" : "50mb";
app.use(
  express.json({
    limit: bodyLimit,
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        logger.error("Malformed JSON received", {
          ip: (req as any).ip,
          userAgent: (req as any).get?.("user-agent"),
          requestId: (req as any).requestId,
          error: (e as Error).message,
        });
        throw new Error("Invalid JSON format");
      }
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? allowedOrigins : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "X-Request-ID",
    ],
    exposedHeaders: ["set-cookie", "X-Request-ID"],
  })
);

// Logging middleware with winston
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    logger.info("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      requestId: req.requestId,
    });
    next();
  });
} else {
  app.use(morgan("dev"));
}

// Enhanced health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "unknown",
    requestId: req.requestId,
    services: {
      database: "unknown",
      redis: "unknown",
      cloudinary: "unknown",
    },
    system: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
      },
      cpu: process.cpuUsage(),
    },
  };

  try {
    // Check Database
    try {
      if (mongoose.connection.readyState === 1) {
        const admin = mongoose.connection.db?.admin();
        if (admin) {
          await admin.ping();
          healthCheck.services.database = "connected";
        } else {
          healthCheck.services.database = "disconnected";
        }
      } else {
        healthCheck.services.database = "disconnected";
      }
    } catch (dbError) {
      healthCheck.services.database = "disconnected";
      logger.error("Database health check failed", {
        error: (dbError as Error).message,
        requestId: req.requestId,
      });
    }

    // Check Redis
    try {
      const redisHealthy = await checkRedisHealth();
      healthCheck.services.redis = redisHealthy ? "connected" : "disconnected";
    } catch (redisError) {
      healthCheck.services.redis = "disconnected";
      logger.error("Redis health check failed", {
        error: (redisError as Error).message,
        requestId: req.requestId,
      });
    }

    // Check Cloudinary
    try {
      await cloudinary.api.ping();
      healthCheck.services.cloudinary = "connected";
    } catch (cloudinaryError) {
      healthCheck.services.cloudinary = "disconnected";
      logger.error("Cloudinary health check failed", {
        error: (cloudinaryError as Error).message,
        requestId: req.requestId,
      });
    }

    // Determine overall status
    const allServicesHealthy = Object.values(healthCheck.services).every(
      (status) => status === "connected"
    );

    const statusCode = allServicesHealthy ? 200 : 503;
    healthCheck.status = allServicesHealthy ? "OK" : "DEGRADED";

    // Log health check results in production
    if (process.env.NODE_ENV === "production" && !allServicesHealthy) {
      logger.warn("Health check failed", {
        services: healthCheck.services,
        requestId: req.requestId,
      });
    }

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error("Health check endpoint error", {
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId: req.requestId,
    });

    res.status(503).json({
      ...healthCheck,
      status: "ERROR",
      error:
        process.env.NODE_ENV !== "production"
          ? (error as Error).message
          : "Service check failed",
    });
  }
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/patients/excel", patientsFromExcel);
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/calendar", calendarRouter);

// API documentation route with better response
app.get("/api/v1", (req: Request, res: Response) => {
  return ApiResponseHandler.success(
    res,
    {
      message: "Patient Management API v1",
      version: "1.0.0",
      endpoints: {
        auth: "/api/v1/auth",
        users: "/api/v1/users",
        patients: "/api/v1/patients",
        patientsExcel: "/api/v1/patients/excel",
      },
      docs: "Contact admin for API documentation",
      health: "/health",
    },
    "API Information retrieved successfully"
  );
});

// 404 handler with logging
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    requestId: req.requestId,
  });

  return ApiResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
});

// Global error handling middleware with winston logging
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log all errors with context
  logger.error("Application error", {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    requestId: req.requestId,
    userId: (req as any).user?._id,
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Invalid resource ID";
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors as any)
      .map((val: any) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  // Handle JSON parsing errors
  if (err.message === "Invalid JSON format") {
    error = { message: "Invalid JSON format in request body", statusCode: 400 };
  }

  // Use ApiResponseHandler for consistent error responses
  return ApiResponseHandler.error(
    res,
    error.message || "Internal Server Error",
    error.statusCode || 500,
    process.env.NODE_ENV !== "production" ? err.stack : undefined
  );
});

export default app;
