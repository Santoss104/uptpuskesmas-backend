import express from "express";
import {
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
} from "../controllers/authController";
import { isAutheticated } from "../middleware/authMiddleware";
import {
  loginRateLimit,
  registrationRateLimit,
} from "../middleware/authRateLimit";
import {
  validateRequest,
  userRegistrationSchema,
  loginSchema,
} from "../validators/schemas";

const authRouter = express.Router();

// Apply rate limiting and validation to sensitive auth endpoints
authRouter.post(
  "/registration",
  registrationRateLimit,
  validateRequest(userRegistrationSchema),
  registrationUser
);
authRouter.post(
  "/login",
  loginRateLimit,
  validateRequest(loginSchema),
  loginUser
);
authRouter.get("/logout", isAutheticated, logoutUser);
authRouter.post("/social-auth", loginRateLimit, socialAuth); // Also rate limit social auth

export default authRouter;
