import { Request, Response, NextFunction } from "express";
import UserModel from "../models/userModel";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { redis } from "../utils/redis";
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/userService";
import cloudinary from "cloudinary";

// get user info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user info
interface IUpdateUserInfo {
  email?: string;
}

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (email) {
        // Check if email already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser && String(existingUser._id) !== userId) {
          return next(new ErrorHandler("Email already exists", 400));
        }
        user.email = email;
      }

      await user.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user password
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;

      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please enter old and new password", 400));
      }

      const user = await UserModel.findById(req.user?._id).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (user.password === undefined) {
        return next(new ErrorHandler("Invalid user", 400));
      }

      const isPasswordMatch = await user.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password", 400));
      }

      user.password = newPassword;

      await user.save();
      await redis.set(req.user?._id, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update profile picture
interface IUpdateProfilePicture {
  avatar: string;
}

export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateProfilePicture;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (avatar) {
        // Delete old avatar if exists and it's from Cloudinary
        if (
          user.avatar?.public_id &&
          !user.avatar.public_id.startsWith("external_")
        ) {
          try {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
          } catch (error) {
            console.log("Could not delete old avatar:", error);
            // Continue even if deletion fails
          }
        }

        // Upload new avatar
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });

        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await user.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get all users --- only for admin
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user role --- only for admin
export const updateUserRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role } = req.body;

      // Validate role
      if (!["user", "admin"].includes(role)) {
        return next(new ErrorHandler("Invalid role", 400));
      }

      const isUserExist = await UserModel.findOne({ email });
      if (isUserExist) {
        const id = isUserExist._id;
        updateUserRoleService(res, id as string, role);
      } else {
        res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Delete user --- only for admin
export const deleteUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Delete avatar from cloudinary if exists
      if (user.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }

      // Delete user
      await user.deleteOne();
      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get user profile (public endpoint for viewing other users)
export const getUserProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id).select("-password");

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);