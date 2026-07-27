import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().or(z.literal("")).optional(),
  college: z.string().max(120).optional(),
  branch: z.string().max(120).optional(),
  gradYear: z.coerce.number().int().min(2000).max(2100).optional(),
  targetRole: z.string().max(120).optional(),
});

const pomodoroPrefs = z.object({
  focus: z.number().int().min(1).max(180),
  shortBreak: z.number().int().min(1).max(60),
  longBreak: z.number().int().min(1).max(60),
  longBreakInterval: z.number().int().min(1).max(12),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean(),
  sound: z.boolean(),
});

const emailPrefs = z.object({
  morningDigest: z.boolean(),
  nightSummary: z.boolean(),
  missedStudy: z.boolean(),
  achievements: z.boolean(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  accent: z.string().max(20).optional(),
  dailyGoalHours: z.number().min(0).max(24).optional(),
  dailyGoalTasks: z.number().int().min(0).max(100).optional(),
  pomodoro: pomodoroPrefs.partial().optional(),
  email: emailPrefs.partial().optional(),
  timezone: z.string().max(60).optional(),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
