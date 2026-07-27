import { useState } from "react";
import { CalendarDays, Target, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCalendar } from "@/components/tasks/TaskCalendar";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTasks } from "@/hooks/useTasks";
import { toDateKey } from "@/lib/date";
import type { Task, TaskInput } from "@/types/task";

export default function MonthlyPlannerPage() {
  const { data: allTasks = [] } = useTasks({ limit: 500, sort: "order", order: "asc" });
  const { data: monthlyGoals = [] } = useTasks({ scope: "monthly", sort: "order", order: "asc" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaults, setDefaults] = useState<Partial<TaskInput>>({});

  const openCreate = (d: Partial<TaskInput>) => {
    setEditing(null);
    setDefaults(d);
    setDialogOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditing(task);
    setDefaults({});
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Planner"
        description="See the big picture and set your monthly goals."
        icon={<CalendarDays className="h-5 w-5" />}
        actions={
          <Button variant="gradient" onClick={() => openCreate({ scope: "monthly" })}>
            <Plus className="h-4 w-4" /> Monthly goal
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TaskCalendar
            tasks={allTasks}
            onEdit={openEdit}
            onSelectDate={(date) => openCreate({ date: toDateKey(date), scope: "daily" })}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" /> Monthly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {monthlyGoals.length === 0 ? (
              <EmptyState
                icon={<Target className="h-5 w-5" />}
                title="No monthly goals"
                description="Set a few big goals to aim for this month."
                className="py-8"
              />
            ) : (
              monthlyGoals.map((t) => <TaskItem key={t._id} task={t} onEdit={openEdit} />)
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} defaults={defaults} />
    </div>
  );
}
