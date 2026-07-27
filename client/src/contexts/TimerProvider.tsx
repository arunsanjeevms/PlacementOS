import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TimerContext, type PendingCompletion, type TimerStatus } from "./timer-context";
import { POMODORO_PRESETS, type Phase } from "@/constants/pomodoro";
import { sounds } from "@/lib/sounds";
import type { SessionMode } from "@/types/session";

interface TimerState {
  presetKey: SessionMode;
  durations: { focus: number; shortBreak: number; longBreak: number; longBreakInterval: number };
  phase: Phase;
  status: TimerStatus;
  secondsLeft: number;
  endsAt: number | null;
  cycle: number;
  category: string;
  taskId?: string;
  taskTitle?: string;
  focusStartedAt: string | null;
}

const STORAGE_KEY = "pos-timer";
const classic = POMODORO_PRESETS[0];

function defaultState(): TimerState {
  return {
    presetKey: "25/5",
    durations: { focus: classic.focus, shortBreak: classic.shortBreak, longBreak: classic.longBreak, longBreakInterval: classic.longBreakInterval },
    phase: "focus",
    status: "idle",
    secondsLeft: classic.focus * 60,
    endsAt: null,
    cycle: 0,
    category: "DSA",
    focusStartedAt: null,
  };
}

function load(): TimerState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = { ...defaultState(), ...(JSON.parse(raw) as Partial<TimerState>) };
    // Recompute remaining if it was running.
    if (parsed.status === "running" && parsed.endsAt) {
      parsed.secondsLeft = Math.max(0, Math.round((parsed.endsAt - Date.now()) / 1000));
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

function phaseSeconds(phase: Phase, d: TimerState["durations"]): number {
  if (phase === "focus") return d.focus * 60;
  if (phase === "short_break") return d.shortBreak * 60;
  return d.longBreak * 60;
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>(load);
  const [pending, setPending] = useState<PendingCompletion | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist on every change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const completeFocus = useCallback((s: TimerState): TimerState => {
    const nextCycle = s.cycle + 1;
    const isLong = nextCycle % s.durations.longBreakInterval === 0;
    const nextPhase: Phase = isLong ? "long_break" : "short_break";
    const endedAt = new Date().toISOString();
    const startedAt = s.focusStartedAt ?? new Date(Date.now() - s.durations.focus * 60000).toISOString();
    setPending({
      durationMinutes: s.durations.focus,
      category: s.category,
      taskId: s.taskId,
      taskTitle: s.taskTitle,
      startedAt,
      endedAt,
      mode: s.presetKey,
    });
    try {
      sounds.complete();
    } catch {
      /* audio blocked */
    }
    return {
      ...s,
      phase: nextPhase,
      status: "idle",
      cycle: nextCycle,
      secondsLeft: phaseSeconds(nextPhase, s.durations),
      endsAt: null,
      focusStartedAt: null,
    };
  }, []);

  const completeBreak = useCallback((s: TimerState): TimerState => {
    try {
      sounds.breakOver();
    } catch {
      /* ignore */
    }
    return { ...s, phase: "focus", status: "idle", secondsLeft: s.durations.focus * 60, endsAt: null, focusStartedAt: null };
  }, []);

  // Ticking loop — always mounted; only acts while running.
  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current;
      if (s.status !== "running" || s.endsAt == null) return;
      const remaining = Math.max(0, Math.round((s.endsAt - Date.now()) / 1000));
      if (remaining > 0) {
        setState((prev) => (prev.secondsLeft === remaining ? prev : { ...prev, secondsLeft: remaining }));
      } else {
        setState((prev) => (prev.phase === "focus" ? completeFocus(prev) : completeBreak(prev)));
      }
    }, 250);
    return () => clearInterval(id);
  }, [completeFocus, completeBreak]);

  const start = useCallback(() => {
    setState((s) => {
      if (s.status === "running") return s;
      const secs = s.secondsLeft > 0 ? s.secondsLeft : phaseSeconds(s.phase, s.durations);
      try {
        sounds.start();
      } catch {
        /* ignore */
      }
      return {
        ...s,
        status: "running",
        secondsLeft: secs,
        endsAt: Date.now() + secs * 1000,
        focusStartedAt: s.phase === "focus" && !s.focusStartedAt ? new Date().toISOString() : s.focusStartedAt,
      };
    });
  }, []);

  const pause = useCallback(() => {
    setState((s) => {
      if (s.status !== "running" || !s.endsAt) return s;
      return { ...s, status: "paused", secondsLeft: Math.max(0, Math.round((s.endsAt - Date.now()) / 1000)), endsAt: null };
    });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, status: "idle", secondsLeft: phaseSeconds(s.phase, s.durations), endsAt: null, focusStartedAt: null }));
  }, []);

  const skip = useCallback(() => {
    setState((s) => {
      const nextPhase: Phase = s.phase === "focus" ? "short_break" : "focus";
      return { ...s, phase: nextPhase, status: "idle", secondsLeft: phaseSeconds(nextPhase, s.durations), endsAt: null, focusStartedAt: null };
    });
  }, []);

  const setPreset = useCallback((key: SessionMode) => {
    const preset = POMODORO_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setState((s) => {
      const durations = { focus: preset.focus, shortBreak: preset.shortBreak, longBreak: preset.longBreak, longBreakInterval: preset.longBreakInterval };
      return { ...s, presetKey: key, durations, status: "idle", endsAt: null, secondsLeft: phaseSeconds(s.phase, durations), focusStartedAt: null };
    });
  }, []);

  const setCustom = useCallback((d: { focus: number; shortBreak: number; longBreak: number }) => {
    setState((s) => {
      const durations = { ...s.durations, focus: d.focus, shortBreak: d.shortBreak, longBreak: d.longBreak };
      return { ...s, presetKey: "custom", durations, status: "idle", endsAt: null, secondsLeft: phaseSeconds(s.phase, durations), focusStartedAt: null };
    });
  }, []);

  const setCategory = useCallback((c: string) => setState((s) => ({ ...s, category: c })), []);
  const setTask = useCallback(
    (task?: { id: string; title: string }) => setState((s) => ({ ...s, taskId: task?.id, taskTitle: task?.title })),
    []
  );
  const resolvePending = useCallback(() => setPending(null), []);

  const value = useMemo(
    () => ({
      presetKey: state.presetKey,
      phase: state.phase,
      status: state.status,
      secondsLeft: state.secondsLeft,
      totalSeconds: phaseSeconds(state.phase, state.durations),
      cycle: state.cycle,
      category: state.category,
      taskId: state.taskId,
      taskTitle: state.taskTitle,
      durations: state.durations,
      pending,
      start,
      pause,
      reset,
      skip,
      setPreset,
      setCustom,
      setCategory,
      setTask,
      resolvePending,
    }),
    [state, pending, start, pause, reset, skip, setPreset, setCustom, setCategory, setTask, resolvePending]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
