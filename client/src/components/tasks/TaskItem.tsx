import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Pin, ChevronRight, ListChecks, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryDot, DeadlineChip, DifficultyBadge, PriorityBadge, RepeatChip } from "./TaskBadges";
import { useDeleteTask, useSubtaskMutations, useToggleTask, useUpdateTask } from "@/hooks/useTasks";
import { formatMinutes, cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const toggle = useToggleTask();
  const del = useDeleteTask();
  const update = useUpdateTask();
  const { toggle: toggleSub } = useSubtaskMutations();
  const [expanded, setExpanded] = useState(false);

  const done = task.status === "done";
  const doneSubs = task.subtasks.filter((s) => s.done).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        "group rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-border/80",
        done && "opacity-65"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={done} onCheckedChange={() => toggle.mutate(task._id)} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => task.subtasks.length && setExpanded((e) => !e)}
              className="flex min-w-0 items-center gap-1.5 text-left"
            >
              {task.subtasks.length > 0 && (
                <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-90")} />
              )}
              <span className={cn("truncate text-sm font-medium", done && "line-through")}>{task.title}</span>
              {task.pinned && <Pin className="h-3 w-3 shrink-0 fill-primary text-primary" />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(task)}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => update.mutate({ id: task._id, input: { pinned: !task.pinned } })}>
                  <Pin /> {task.pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => del.mutate(task._id)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && !done && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <CategoryDot category={task.category} withLabel />
            <PriorityBadge priority={task.priority} />
            {task.difficulty && <DifficultyBadge difficulty={task.difficulty} />}
            {task.deadline && <DeadlineChip deadline={task.deadline} done={done} />}
            <RepeatChip repeat={task.repeat} />
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
            {task.tags.map((t) => (
              <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>

          {expanded && task.subtasks.length > 0 && (
            <div className="mt-2 space-y-1 border-l-2 border-border pl-3">
              {task.subtasks.map((s) => (
                <label key={s._id} className="flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox checked={s.done} onCheckedChange={() => toggleSub.mutate({ id: task._id, subId: s._id })} className="h-3.5 w-3.5" />
                  <span className={cn(s.done && "text-muted-foreground line-through")}>{s.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
