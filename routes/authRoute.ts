import express from "express";
import {
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
  createAdminUser,
  updateAccessToken,
} from "../controllers/authController";
import { isAutheticated, authorizeRoles } from "../middleware/authMiddleware";
import UserModel from "../models/userModel";
import {
  registrationRateLimit,
  loginRateLimit,
} from "../middleware/authRateLimit";
import {
  validateRequest,
  userRegistrationSchema,
  loginSchema,
} from "../validators/schemas";

const authRouter = express.Router();

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
authRouter.post("/refresh", updateAccessToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user?._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const newAccessToken = user.SignAccessToken();

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newAccessToken,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Token refresh failed",
    });
  }
});
authRouter.post("/social-auth", loginRateLimit, socialAuth);
authRouter.post(
  "/create-admin",
  isAutheticated,
  authorizeRoles("admin"),
  validateRequest(userRegistrationSchema),
  createAdminUser
);

export default authRouter;
