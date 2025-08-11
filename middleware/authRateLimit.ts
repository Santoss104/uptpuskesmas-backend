import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import logger from "../utils/logger";
import { ApiResponseHandler } from "../utils/apiResponse";

// Rate limiting for login attempts per IP
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 500, // Increased: 100 attempts in production, 500 in dev
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  // Use default key generator for better IPv6 support
  // keyGenerator will default to req.ip which handles IPv6 properly
  handler: (req: Request, res: Response) => {
    logger.warn("Login rate limit exceeded", {
      ip: req.ip,
      email: req.body?.email || "unknown",
      userAgent: req.get("user-agent"),
      requestId: (req as any).requestId,
    });

    return ApiResponseHandler.error(
      res,
      "Too many login attempts from this account, please try again later.",
      429
    );
  },
});

// Rate limiting for registration per IP
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === "production" ? 100 : 500, // Increased: 100 registrations per hour in production, 500 in dev
  message: {
    success: false,
    message: "Too many registration attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Registration rate limit exceeded", {
      ip: req.ip,
      email: req.body?.email || "unknown",
      userAgent: req.get("user-agent"),
      requestId: (req as any).requestId,
    });

    return ApiResponseHandler.error(
      res,
      "Too many registration attempts, please try again later.",
      429
    );
  },
});

// Rate limiting for password reset attempts
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === "production" ? 20 : 50, // Increased: 20 attempts per hour in production
  message: {
    success: false,
    message: "Too many password reset attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator for IPv6 compatibility, can be customized with email in middleware logic
  handler: (req: Request, res: Response) => {
    logger.warn("Password reset rate limit exceeded", {
      ip: req.ip,
      email: req.body?.email || "unknown",
      userAgent: req.get("user-agent"),
      requestId: (req as any).requestId,
    });

    return ApiResponseHandler.error(
      res,
      "Too many password reset attempts, please try again later.",
      429
    );
  },
});

// Rate limiting for CRUD operations (Create, Read, Update, Delete)
export const crudRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: process.env.NODE_ENV === "production" ? 1000 : 5000, // Very high limit: 1000 CRUD operations/hour in production
  message: {
    success: false,
    message: "Too many CRUD operations, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests for monitoring
  handler: (req: Request, res: Response) => {
    logger.warn("CRUD rate limit exceeded", {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get("user-agent"),
      requestId: (req as any).requestId,
    });

    return ApiResponseHandler.error(
      res,
      "Too many CRUD operations from this IP, please try again later.",
      429
    );
  },
});

// Rate limiting for Excel operations (Export/Import)
export const excelRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: process.env.NODE_ENV === "production" ? 50 : 200, // 50 Excel operations/hour in production
  message: {
    success: false,
    message: "Too many Excel operations, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Excel rate limit exceeded", {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get("user-agent"),
      requestId: (req as any).requestId,
    });

    return ApiResponseHandler.error(
      res,
      "Too many Excel operations from this IP, please try again later.",
      429
    );
  },
});
