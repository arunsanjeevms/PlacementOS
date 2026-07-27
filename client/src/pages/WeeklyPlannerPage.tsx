import { useMemo, useState } from "react";
import { addWeeks, eachDayOfInterval, endOfWeek, format, isToday, startOfWeek, subWeeks } from "date-fns";
import { CalendarRange, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Task, TaskInput } from "@/types/task";

export default function WeeklyPlannerPage() {
  const [anchor, setAnchor] = useState(() => new Date());
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  const { data: tasks = [] } = useTasks({
    from: toDateKey(weekStart),
    to: toDateKey(weekEnd),
    sort: "order",
    order: "asc",
    limit: 500,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaults, setDefaults] = useState<Partial<TaskInput>>({});

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.date) continue;
      const key = format(new Date(t.date), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  const openCreate = (date: Date) => {
    setEditing(null);
    setDefaults({ date: toDateKey(date), scope: "weekly" });
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
        title="Weekly Planner"
        description={`${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`}
        icon={<CalendarRange className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => setAnchor((a) => subWeeks(a, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
              This week
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setAnchor((a) => addWeeks(a, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = byDay.get(key) ?? [];
          return (
            <div key={key} className="flex flex-col rounded-2xl border border-border bg-muted/20">
              <div className={cn("flex items-center justify-between border-b border-border px-3 py-2", isToday(day) && "bg-primary/8")}>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{format(day, "EEE")}</p>
                  <p className={cn("text-sm font-semibold", isToday(day) && "text-primary")}>{format(day, "d")}</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => openCreate(day)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {dayTasks.map((t) => (
                  <TaskCard key={t._id} task={t} onClick={() => openEdit(t)} />
                ))}
                {dayTasks.length === 0 && (
                  <button
                    onClick={() => openCreate(day)}
                    className="rounded-lg border border-dashed border-border/60 py-4 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} defaults={defaults} />
    </div>
  );
}
