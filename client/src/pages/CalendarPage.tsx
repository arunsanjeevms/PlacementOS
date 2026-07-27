import { useState } from "react";
import { Calendar as CalendarIcon, Clock, CheckSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCalendar } from "@/components/tasks/TaskCalendar";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { useDayDetail } from "@/hooks/useAnalytics";
import { toDateKey } from "@/lib/date";
import { formatMinutes } from "@/lib/utils";
import type { Task, TaskInput } from "@/types/task";

export default function CalendarPage() {
  const { data: tasks = [] } = useTasks({ limit: 500, sort: "order", order: "asc" });
  const [selectedDay, setSelectedDay] = useState<string>(toDateKey(new Date()));
  const { data: detail } = useDayDetail(selectedDay);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaults, setDefaults] = useState<Partial<TaskInput>>({});

  const openCreate = (d: Partial<TaskInput>) => {
    setEditing(null);
    setDefaults(d);
    setDialogOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setDefaults({});
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Tasks, deadlines and study sessions at a glance."
        icon={<CalendarIcon className="h-5 w-5" />}
        actions={
          <Button variant="gradient" onClick={() => openCreate({ date: selectedDay, scope: "daily" })}>
            <Plus className="h-4 w-4" /> Schedule task
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TaskCalendar tasks={tasks} onEdit={openEdit} onSelectDate={(date) => setSelectedDay(toDateKey(date))} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{format(new Date(selectedDay), "EEEE, MMM d")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail && detail.minutes > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-2 text-sm">
                <Clock className="h-4 w-4 text-primary" /> {formatMinutes(detail.minutes)} studied
              </div>
            )}

            {detail?.sessions.length ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sessions</p>
                {detail.sessions.map((s) => (
                  <div key={s._id} className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-sm">
                    <span>{s.taskTitle || s.category}</span>
                    <span className="text-muted-foreground">{formatMinutes(s.durationMinutes)}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {detail?.tasks.length ? (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <CheckSquare className="h-3.5 w-3.5" /> Completed
                </p>
                {detail.tasks.map((t) => (
                  <div key={t._id} className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-sm">{t.title}</div>
                ))}
              </div>
            ) : null}

            {(!detail || (detail.minutes === 0 && detail.tasks.length === 0)) && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing recorded yet. Click a task or schedule one.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} defaults={defaults} />
    </div>
  );
}
