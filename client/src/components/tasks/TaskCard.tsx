import { ListChecks, Pin, Clock } from "lucide-react";
import { CategoryDot, DeadlineChip, DifficultyBadge, PriorityBadge } from "./TaskBadges";
import { formatMinutes, cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  dragging?: boolean;
}

export function TaskCard({ task, onClick, dragging }: TaskCardProps) {
  const done = task.status === "done";
  const doneSubs = task.subtasks.filter((s) => s.done).length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer select-none rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/40",
        dragging && "rotate-1 shadow-xl ring-2 ring-primary/30",
        done && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-sm font-medium leading-snug", done && "line-through")}>{task.title}</p>
        {task.pinned && <Pin className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" />}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <CategoryDot category={task.category} withLabel />
        <PriorityBadge priority={task.priority} />
        {task.difficulty && <DifficultyBadge difficulty={task.difficulty} />}
      </div>

      {(task.deadline || task.subtasks.length > 0 || task.estimatedMinutes) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-2">
          {task.deadline && <DeadlineChip deadline={task.deadline} done={done} />}
          {task.estimatedMinutes ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {formatMinutes(task.estimatedMinutes)}
            </span>
          ) : null}
          {task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ListChecks className="h-3 w-3" /> {doneSubs}/{task.subtasks.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
