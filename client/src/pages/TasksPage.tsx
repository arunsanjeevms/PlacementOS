import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CheckSquare, Plus, Search, LayoutList, Columns3, Calendar as CalendarIcon, GitBranch, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskCard } from "@/components/tasks/TaskCard";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskCalendar } from "@/components/tasks/TaskCalendar";
import { TaskTimeline } from "@/components/tasks/TaskTimeline";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { useDebounce } from "@/hooks/useDebounce";
import { TASK_CATEGORIES, PRIORITIES, PRIORITY_META, type TaskStatus } from "@/constants/tasks";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Task, TaskInput } from "@/types/task";

type View = "list" | "board" | "calendar" | "timeline";

const VIEWS: { value: View; label: string; icon: typeof LayoutList }[] = [
  { value: "list", label: "List", icon: LayoutList },
  { value: "board", label: "Board", icon: Columns3 },
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "timeline", label: "Timeline", icon: GitBranch },
];

export default function TasksPage() {
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaults, setDefaults] = useState<Partial<TaskInput>>({});

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: category === "all" ? undefined : category,
      priority: priority === "all" ? undefined : priority,
      sort: "order",
      order: "asc" as const,
    }),
    [debouncedSearch, category, priority]
  );

  const { data: tasks = [], isLoading } = useTasks(params);

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.order - b.order),
    [tasks]
  );

  const openCreate = (d: Partial<TaskInput> = {}) => {
    setEditing(null);
    setDefaults(d);
    setDialogOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditing(task);
    setDefaults({});
    setDialogOpen(true);
  };

  const hasFilters = search || category !== "all" || priority !== "all";
  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setPriority("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Plan, prioritize and track everything on your placement journey."
        icon={<CheckSquare className="h-5 w-5" />}
        actions={
          <Button variant="gradient" onClick={() => openCreate()}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {TASK_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_META[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* View switcher */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              onClick={() => setView(v.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === v.value ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <v.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-6 w-6" />}
          title={hasFilters ? "No tasks match your filters" : "No tasks yet"}
          description={hasFilters ? "Try adjusting your search or filters." : "Create your first task to start planning your prep."}
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button variant="gradient" onClick={() => openCreate()}>
                <Plus className="h-4 w-4" /> New Task
              </Button>
            )
          }
        />
      ) : view === "list" ? (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {sorted.map((t) => (
              <TaskItem key={t._id} task={t} onEdit={openEdit} />
            ))}
          </AnimatePresence>
        </div>
      ) : view === "board" ? (
        <KanbanBoard tasks={tasks} onEdit={openEdit} onAdd={(status: TaskStatus) => openCreate({ status })} />
      ) : view === "calendar" ? (
        <TaskCalendar
          tasks={tasks}
          onEdit={openEdit}
          onSelectDate={(date) => openCreate({ date: toDateKey(date), scope: "daily" })}
        />
      ) : (
        <TaskTimeline tasks={sorted} onEdit={openEdit} />
      )}

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} defaults={defaults} />
    </div>
  );
}

/** Re-export so other pages can drop in a compact task card. */
export { TaskCard };
