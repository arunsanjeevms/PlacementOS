import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_HUE } from "@/constants/tasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskCalendarProps {
  tasks: Task[];
  onSelectDate: (date: Date) => void;
  onEdit: (task: Task) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TaskCalendar({ tasks, onSelectDate, onEdit }: TaskCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const key = t.date ? format(new Date(t.date), "yyyy-MM-dd") : t.deadline ? format(new Date(t.deadline), "yyyy-MM-dd") : null;
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-base font-semibold">{format(month, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={cn(
                "group min-h-[92px] border-b border-r border-border/60 p-1.5 text-left transition-colors hover:bg-accent/40",
                !inMonth && "bg-muted/20 text-muted-foreground/50"
              )}
            >
              <span
                className={cn(
                  "inline-grid h-6 w-6 place-items-center rounded-full text-xs font-medium",
                  isToday(day) && "bg-primary text-primary-foreground",
                  isSameDay(day, new Date()) || "group-hover:bg-accent"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(t);
                    }}
                    className={cn(
                      "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px]",
                      t.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                    style={{ backgroundColor: `hsl(${CATEGORY_HUE[t.category] ?? 240} 70% 55% / 0.14)` }}
                  >
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && <p className="px-1 text-[10px] text-muted-foreground">+{dayTasks.length - 3} more</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
