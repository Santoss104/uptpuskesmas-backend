import dotenv from "dotenv";
import { Response } from "express";
import { IUser } from "../models/userModel";
import { redis } from "./redis";

dotenv.config();

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

// parse enviroment variables to integrates with fallback values
const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "900", // 15 minutes default
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "10080", // 7 days default
  10
);

// options for cookies - Production security enhanced
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 1000), // Changed from hours to seconds
  maxAge: accessTokenExpire * 1000, // Changed from hours to seconds
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Stricter for production
  secure: process.env.NODE_ENV === "production", // Only secure in production
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 60 * 1000), // Minutes to milliseconds
  maxAge: refreshTokenExpire * 60 * 1000, // Minutes to milliseconds
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Stricter for production
  secure: process.env.NODE_ENV === "production", // Only secure in production
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // Store in Redis with proper TTL
  const redisTTL = process.env.NODE_ENV === "production" ? 604800 : 259200; // 7 days prod, 3 days dev
  redis.set(user._id as string, JSON.stringify(user), "EX", redisTTL);

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  // Don't send sensitive data in production
  const userResponse = {
    _id: user._id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar,
    displayName: user.displayName,
    ...(process.env.NODE_ENV !== "production" && {
      lastLogin: user.lastLogin,
    }),
  };

  res.status(statusCode).json({
    success: true,
    user: userResponse,
    ...(process.env.NODE_ENV !== "production" && {
      accessToken,
      refreshToken,
    }),
  });
};
