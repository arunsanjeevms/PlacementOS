import { useMemo } from "react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/types/task";

interface TaskTimelineProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

function bucketLabel(iso?: string): string {
  if (!iso) return "No date";
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export function TaskTimeline({ tasks, onEdit }: TaskTimelineProps) {
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; ts: number; tasks: Task[] }>();
    for (const t of tasks) {
      const iso = t.date ?? t.deadline;
      const key = iso ? format(new Date(iso), "yyyy-MM-dd") : "none";
      const label = bucketLabel(iso);
      const ts = iso ? new Date(iso).getTime() : Number.MAX_SAFE_INTEGER;
      if (!map.has(key)) map.set(key, { label, ts, tasks: [] });
      map.get(key)!.tasks.push(t);
    }
    return [...map.values()].sort((a, b) => a.ts - b.ts);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label} className="relative pl-6">
          <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
          <div className="absolute bottom-0 left-[4.5px] top-5 w-px bg-border" />
          <h3 className="mb-2 text-sm font-semibold">
            {group.label} <span className="ml-1 text-xs font-normal text-muted-foreground">{group.tasks.length}</span>
          </h3>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {group.tasks.map((t) => (
                <TaskItem key={t._id} task={t} onEdit={onEdit} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
