import dotenv from "dotenv";
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: "user" | "admin";
  isVerified: boolean;
  displayName?: string;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  passwordChangedAt?: Date;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
  isAdmin: () => boolean;
  // NEW: Security methods
  isLocked: () => boolean;
  incrementLoginAttempts: () => Promise<void>;
  resetLoginAttempts: () => Promise<void>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"], // Improved from 6 to 8
      validate: {
        validator: function (value: string) {
          // Strong password validation for production
          if (process.env.NODE_ENV === "production") {
            // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
              value
            );
          }
          // Development: just minimum length
          return value.length >= 8;
        },
        message:
          process.env.NODE_ENV === "production"
            ? "Password must contain at least 8 characters with uppercase, lowercase, number, and special character"
            : "Password must be at least 8 characters",
      },
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // NEW: Security tracking fields for production
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.displayName = generateDisplayNameFromEmail(ret.email);
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.displayName = generateDisplayNameFromEmail(ret.email);
        return ret;
      },
    },
  }
);

// Helper function untuk generate display name
function generateDisplayNameFromEmail(email: string): string {
  if (!email) return "User";

  const username = email.split("@")[0];

  return username
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

// Only add role index (email index is already created by unique: true)
userSchema.index({ role: 1 });

// Password hashing middleware - Improved security
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Use higher salt rounds for production
  const saltRounds = process.env.NODE_ENV === "production" ? 12 : 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// JWT Methods - Improved token expiry for production
userSchema.methods.SignAccessToken = function () {
  const expiry = process.env.NODE_ENV === "production" ? "15m" : "5m"; // 15 min for production
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: expiry,
  });
};

userSchema.methods.SignRefreshToken = function () {
  const expiry = process.env.NODE_ENV === "production" ? "7d" : "3d"; // 7 days for production
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: expiry,
  });
};

// Password comparison
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isAdmin = function (): boolean {
  return this.role === "admin";
};

// NEW: Security methods for production
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // If we have exceeded max attempts and it's not locked already, lock the account
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  });
};

const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;
