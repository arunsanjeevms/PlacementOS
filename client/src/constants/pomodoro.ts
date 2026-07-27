import type { SessionMode } from "@/types/session";

export type Phase = "focus" | "short_break" | "long_break";

export interface PomodoroPreset {
  key: Exclude<SessionMode, "manual">;
  label: string;
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

export const POMODORO_PRESETS: PomodoroPreset[] = [
  { key: "25/5", label: "Classic", focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
  { key: "45/10", label: "Deep", focus: 45, shortBreak: 10, longBreak: 20, longBreakInterval: 4 },
  { key: "60/10", label: "Flow", focus: 60, shortBreak: 10, longBreak: 25, longBreakInterval: 3 },
  { key: "90/20", label: "Ultradian", focus: 90, shortBreak: 20, longBreak: 30, longBreakInterval: 2 },
];

export const PHASE_META: Record<Phase, { label: string; color: string }> = {
  focus: { label: "Focus", color: "hsl(var(--primary))" },
  short_break: { label: "Short Break", color: "hsl(160 84% 45%)" },
  long_break: { label: "Long Break", color: "hsl(217 91% 60%)" },
};

export const MOOD_META: { value: import("@/types/session").Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "🤩", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "stressed", emoji: "😰", label: "Stressed" },
];
