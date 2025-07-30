import { Request, Response, NextFunction } from "express";
import UserModel, { IUser } from "../models/userModel";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";

// register user
interface IRegistrationBody {
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, confirmPassword, avatar } = req.body;

      if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }

      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("User already exists", 400));
      }

      // Check if this is the first user - make them admin
      const userCount = await UserModel.countDocuments();
      const isFirstUser = userCount === 0;

      let userAvatar;

      if (avatar) {
        userAvatar = avatar;
      } else {
        // Generate default avatar
        const defaultAvatarUrl =
          "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(email.split("@")[0]) +
          "&background=random&color=fff&size=200";

        try {
          const myCloud = await cloudinary.v2.uploader.upload(
            defaultAvatarUrl,
            {
              folder: "avatars/defaults",
              width: 150,
              public_id: `default_${email.split("@")[0]}_${Date.now()}`,
            }
          );

          userAvatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } catch (cloudinaryError) {
          userAvatar = {
            public_id: `external_default_${Date.now()}`,
            url: defaultAvatarUrl,
          };
        }
      }

      const user = await UserModel.create({
        email,
        password,
        avatar: userAvatar,
        isVerified: true,
        role: isFirstUser ? "admin" : "user",
      });

      res.status(201).json({
        success: true,
        message: isFirstUser
          ? "Admin account created successfully!"
          : "User registered successfully!",
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Create admin user (only for existing admins)
export const createAdminUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }

      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("User already exists", 400));
      }

      // Generate default avatar for admin
      const defaultAvatarUrl =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(email.split("@")[0]) +
        "&background=dc2626&color=fff&size=200";

      let userAvatar;
      try {
        const myCloud = await cloudinary.v2.uploader.upload(defaultAvatarUrl, {
          folder: "avatars/admins",
          width: 150,
          public_id: `admin_${email.split("@")[0]}_${Date.now()}`,
        });

        userAvatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      } catch (cloudinaryError) {
        userAvatar = {
          public_id: `external_admin_${Date.now()}`,
          url: defaultAvatarUrl,
        };
      }

      const adminUser = await UserModel.create({
        email,
        password,
        avatar: userAvatar,
        isVerified: true,
        role: "admin",
      });

      res.status(201).json({
        success: true,
        message: "Admin user created successfully!",
        user: {
          _id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          isVerified: adminUser.isVerified,
          avatar: adminUser.avatar,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login user
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }

      const user = await UserModel.findOne({ email }).select(
        "+password +loginAttempts +lockUntil"
      );

      if (!user) {
        return next(new ErrorHandler("Invalid credentials", 401));
      }

      // Check if account is locked
      if (user.isLocked()) {
        return next(
          new ErrorHandler(
            "Account temporarily locked due to too many failed login attempts",
            423
          )
        );
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        // Increment failed login attempts
        await user.incrementLoginAttempts();
        return next(new ErrorHandler("Invalid credentials", 401));
      }

      // Reset login attempts on successful login
      if (user.loginAttempts && user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// logout user
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });
      const userId = req.user?._id || "";
      redis.del(userId);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// social auth
interface ISocialAuthBody {
  email: string;
  avatar: {
    public_id: string;
    url: string;
  };
}

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, avatar } = req.body as ISocialAuthBody;
      const user = await UserModel.findOne({ email });
      if (!user) {
        const newUser = await UserModel.create({
          email,
          avatar,
          isVerified: true,
        });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update access token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.headers["refresh-token"] as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(
          new ErrorHandler("Please login for access this resources!", 400)
        );
      }

      const user = JSON.parse(session);

      req.user = user;

      await redis.set(user._id, JSON.stringify(user), "EX", 604800);

      return next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
