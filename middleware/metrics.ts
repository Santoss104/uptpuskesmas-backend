import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ip: string;
  userId?: string;
}

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Add request ID for tracing
  req.requestId = Math.random().toString(36).substring(2, 15);

  // Override end method to capture metrics
  const originalEnd = res.end;

  res.end = function (chunk?: any, encoding?: any, cb?: () => void) {
    const responseTime = Date.now() - startTime;

    const metrics: RequestMetrics = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get("user-agent") || "unknown",
      ip: req.ip || req.connection.remoteAddress || "unknown",
      userId: req.user?._id,
    };

    // Log metrics
    if (res.statusCode >= 400) {
      logger.error("HTTP Request Error", {
        requestId: req.requestId,
        ...metrics,
      });
    } else {
      logger.info("HTTP Request", {
        requestId: req.requestId,
        ...metrics,
      });
    }

    // Call original end method and return its result
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Performance monitoring
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === "production") {
    // Monitor memory usage
    const memUsage = process.memoryUsage();

    if (memUsage.heapUsed > 100 * 1024 * 1024) {
      // 100MB threshold
      logger.warn("High memory usage detected", {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
        rss: Math.round(memUsage.rss / 1024 / 1024) + "MB",
      });
    }
  }

  next();
};

// Request ID middleware
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.requestId =
    req.get("X-Request-ID") || Math.random().toString(36).substring(2, 15);
  res.set("X-Request-ID", req.requestId);
  next();
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}
