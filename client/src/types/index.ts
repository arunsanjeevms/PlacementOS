export type Role = "user" | "admin";

export interface PomodoroPrefs {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  sound: boolean;
}

export interface EmailPrefs {
  morningDigest: boolean;
  nightSummary: boolean;
  missedStudy: boolean;
  achievements: boolean;
}

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  accent: string;
  dailyGoalHours: number;
  dailyGoalTasks: number;
  pomodoro: PomodoroPrefs;
  email: EmailPrefs;
  timezone: string;
  weekStartsOn: 0 | 1;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  bio?: string;
  college?: string;
  branch?: string;
  gradYear?: number;
  targetRole?: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
