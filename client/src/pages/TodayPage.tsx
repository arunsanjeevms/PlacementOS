import { useMemo, useState, type KeyboardEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { Sun, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { useTasks, useCreateTask } from "@/hooks/useTasks";
import { formatFullDate, toDateKey } from "@/lib/date";
import type { Task } from "@/types/task";

export default function TodayPage() {
  const todayKey = toDateKey(new Date());
  const { data: todayTasks = [], isLoading } = useTasks({ from: todayKey, to: todayKey, sort: "order", order: "asc" });
  const { data: overdue = [] } = useTasks({ dueTo: toDateKey(new Date(Date.now() - 86400000)), status: "todo" });
  const create = useCreateTask();

  const [quick, setQuick] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const done = useMemo(() => todayTasks.filter((t) => t.status === "done").length, [todayTasks]);
  const pct = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0;

  const addQuick = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && quick.trim()) {
      create.mutate({ title: quick.trim(), date: new Date(todayKey).toISOString(), scope: "daily" });
      setQuick("");
    }
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Today" description={formatFullDate()} icon={<Sun className="h-5 w-5" />} />

      {/* Progress card */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/12 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's progress</p>
              <p className="text-lg font-bold">
                {done} of {todayTasks.length} done
              </p>
            </div>
          </div>
          <div className="flex-1 sm:max-w-xs">
            <Progress value={pct} />
            <p className="mt-1.5 text-right text-xs text-muted-foreground">{pct}% complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick add */}
      <div className="relative">
        <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          onKeyDown={addQuick}
          placeholder="Add a task for today and press Enter…"
          className="pl-9"
        />
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" /> Overdue ({overdue.length})
          </h3>
          <div className="space-y-2">
            {overdue.map((t) => (
              <TaskItem key={t._id} task={t} onEdit={openEdit} />
            ))}
          </div>
        </div>
      )}

      {/* Today's tasks */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : todayTasks.length === 0 ? (
        <EmptyState
          icon={<Sun className="h-6 w-6" />}
          title="Nothing scheduled for today"
          description="Add tasks above or schedule some from the Tasks page to plan your day."
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {todayTasks.map((t) => (
              <TaskItem key={t._id} task={t} onEdit={openEdit} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} />
    </div>
  );
}
