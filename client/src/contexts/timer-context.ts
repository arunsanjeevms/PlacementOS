import { createContext } from "react";
import type { Phase } from "@/constants/pomodoro";
import type { SessionMode } from "@/types/session";

export type TimerStatus = "idle" | "running" | "paused";

export interface PendingCompletion {
  durationMinutes: number;
  category: string;
  taskId?: string;
  taskTitle?: string;
  startedAt: string;
  endedAt: string;
  mode: SessionMode;
}

export interface TimerContextValue {
  presetKey: SessionMode;
  phase: Phase;
  status: TimerStatus;
  secondsLeft: number;
  totalSeconds: number;
  cycle: number;
  category: string;
  taskId?: string;
  taskTitle?: string;
  durations: { focus: number; shortBreak: number; longBreak: number; longBreakInterval: number };
  pending: PendingCompletion | null;

  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  setPreset: (key: SessionMode) => void;
  setCustom: (d: { focus: number; shortBreak: number; longBreak: number }) => void;
  setCategory: (c: string) => void;
  setTask: (task?: { id: string; title: string }) => void;
  resolvePending: () => void;
}

export const TimerContext = createContext<TimerContextValue | null>(null);
