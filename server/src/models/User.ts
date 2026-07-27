import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserRole } from "../utils/tokens.js";

/** A single active refresh-token session (enables per-device logout & rotation). */
export interface RefreshSession {
  tokenId: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
}

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  accent: string;
  dailyGoalHours: number;
  dailyGoalTasks: number;
  pomodoro: {
    focus: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    sound: boolean;
  };
  email: {
    morningDigest: boolean;
    nightSummary: boolean;
    missedStudy: boolean;
    achievements: boolean;
  };
  timezone: string;
  weekStartsOn: 0 | 1;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  college?: string;
  branch?: string;
  gradYear?: number;
  targetRole?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: RefreshSession[];
  preferences: UserPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export const defaultPreferences: UserPreferences = {
  theme: "dark",
  accent: "violet",
  dailyGoalHours: 4,
  dailyGoalTasks: 5,
  pomodoro: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    sound: true,
  },
  email: {
    morningDigest: true,
    nightSummary: true,
    missedStudy: true,
    achievements: true,
  },
  timezone: "Asia/Kolkata",
  weekStartsOn: 1,
};

const refreshSessionSchema = new Schema<RefreshSession>(
  {
    tokenId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: String,
    ip: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatarUrl: String,
    bio: { type: String, maxlength: 500 },
    college: String,
    branch: String,
    gradYear: Number,
    targetRole: String,
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: { type: [refreshSessionSchema], select: false, default: [] },
    preferences: {
      type: Schema.Types.Mixed,
      default: () => structuredClone(defaultPreferences),
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).password;
        delete (ret as Record<string, unknown>).refreshTokens;
        delete (ret as Record<string, unknown>).emailVerificationToken;
        delete (ret as Record<string, unknown>).emailVerificationExpires;
        delete (ret as Record<string, unknown>).passwordResetToken;
        delete (ret as Record<string, unknown>).passwordResetExpires;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

// Hash password whenever it changes.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
