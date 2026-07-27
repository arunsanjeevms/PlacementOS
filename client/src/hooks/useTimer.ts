import { useContext } from "react";
import { TimerContext } from "@/contexts/timer-context";

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
