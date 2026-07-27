export type SessionMode = "25/5" | "45/10" | "60/10" | "90/20" | "custom" | "manual";
export type Mood = "great" | "good" | "okay" | "tired" | "stressed";

export interface StudySession {
  _id: string;
  user: string;
  category: string;
  task?: string;
  taskTitle?: string;
  durationMinutes: number;
  mode: SessionMode;
  productivity?: number;
  mood?: Mood;
  notes?: string;
  startedAt: string;
  endedAt: string;
  dateKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInput {
  category: string;
  task?: string;
  taskTitle?: string;
  durationMinutes: number;
  mode: SessionMode;
  productivity?: number;
  mood?: Mood;
  notes?: string;
  startedAt: string;
  endedAt?: string;
  dateKey?: string;
}

export interface SessionSummary {
  totalMinutes: number;
  totalSessions: number;
  longestSession: number;
  avgSession: number;
  todayMinutes: number;
  todaySessions: number;
  currentStreak: number;
  longestStreak: number;
  categories: { category: string; minutes: number; count: number }[];
  last14Days: { date: string; minutes: number }[];
}
