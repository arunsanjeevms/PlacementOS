import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  compact?: boolean;
}

/** Small +/- number stepper used by the trackers. */
export function Stepper({ value, onChange, min = 0, max = Infinity, step = 1, className, compact }: StepperProps) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-border", className)}>
      <button
        type="button"
        onClick={() => set(value - step)}
        disabled={value <= min}
        className="grid h-7 w-7 place-items-center rounded-l-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("min-w-[2rem] text-center text-sm font-semibold tabular-nums", compact && "min-w-[1.5rem]")}>{value}</span>
      <button
        type="button"
        onClick={() => set(value + step)}
        disabled={value >= max}
        className="grid h-7 w-7 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
