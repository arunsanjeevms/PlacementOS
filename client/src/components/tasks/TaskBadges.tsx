import { CalendarClock, Repeat } from "lucide-react";
import { isBefore, isToday, format } from "date-fns";
import { CATEGORY_HUE, DIFFICULTY_META, PRIORITY_META, type Difficulty, type Priority, type RepeatRule } from "@/constants/tasks";
import { cn } from "@/lib/utils";

export function CategoryDot({ category, withLabel = false }: { category: string; withLabel?: boolean }) {
  const hue = CATEGORY_HUE[category] ?? 240;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${hue} 70% 55%)` }} />
      {withLabel && category}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", meta.className)}>
      {meta.label}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", meta.className)}>
      {meta.label}
    </span>
  );
}

export function DeadlineChip({ deadline, done }: { deadline: string; done?: boolean }) {
  const date = new Date(deadline);
  const overdue = !done && isBefore(date, new Date()) && !isToday(date);
  const today = isToday(date);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        overdue ? "text-destructive" : today ? "text-warning" : "text-muted-foreground"
      )}
    >
      <CalendarClock className="h-3 w-3" />
      {today ? "Today" : format(date, "MMM d")}
    </span>
  );
}

export function RepeatChip({ repeat }: { repeat: RepeatRule }) {
  if (repeat === "none") return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
      <Repeat className="h-3 w-3" />
      {repeat}
    </span>
  );
}
