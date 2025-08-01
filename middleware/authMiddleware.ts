import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { updateAccessToken } from "../controllers/authController";

// authenticated user
export const isAutheticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token =
      (req.headers["access-token"] as string) || req.cookies.access_token;

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    const decoded = jwt.decode(access_token) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid", 400));
    }

    // Check if token is expired
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      try {
        await updateAccessToken(req, res, next);
      } catch (error) {
        return next(error);
      }
    } else {
      const user = await redis.get(decoded.id);

      if (!user) {
        return next(
          new ErrorHandler("Please login to access this resource", 400)
        );
      }

      req.user = JSON.parse(user);
      next();
    }
  }
);

// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is admin
export const isAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") {
      return next(
        new ErrorHandler("Access denied. Admin privileges required.", 403)
      );
    }
    next();
  }
);

// Check if user can access resource (own resource or admin)
export const canAccessResource = (resourceOwnerField: string = "userId") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentUserId = req.user?._id;
    const resourceOwnerId = req.params.id || req.body[resourceOwnerField];

    // Admin can access any resource
    if (req.user?.role === "admin") {
      return next();
    }

    // User can only access their own resources
    if (currentUserId === resourceOwnerId) {
      return next();
    }

    return next(
      new ErrorHandler(
        "Access denied. You can only access your own resources.",
        403
      )
    );
  };
};
