import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/shared/TagInput";
import { Spinner } from "@/components/shared/LoadingScreen";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import {
  DIFFICULTIES,
  PRIORITIES,
  REPEAT_RULES,
  TASK_CATEGORIES,
  TASK_SCOPES,
  TASK_STATUSES,
  STATUS_META,
  PRIORITY_META,
} from "@/constants/tasks";
import type { Task, TaskInput } from "@/types/task";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaults?: Partial<TaskInput>;
}

interface FormValues {
  title: string;
  description: string;
  category: string;
  priority: string;
  difficulty: string;
  scope: string;
  status: string;
  date: string;
  deadline: string;
  estimatedMinutes: string;
  repeat: string;
  notes: string;
  tags: string[];
  links: { label: string; url: string }[];
}

const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");

function taskToForm(task?: Task | null, defaults?: Partial<TaskInput>): FormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    category: task?.category ?? defaults?.category ?? "Custom",
    priority: task?.priority ?? defaults?.priority ?? "medium",
    difficulty: task?.difficulty ?? "",
    scope: task?.scope ?? defaults?.scope ?? "daily",
    status: task?.status ?? defaults?.status ?? "todo",
    date: toDateInput(task?.date ?? (defaults?.date as string | undefined)),
    deadline: toDateInput(task?.deadline),
    estimatedMinutes: task?.estimatedMinutes ? String(task.estimatedMinutes) : "",
    repeat: task?.repeat ?? "none",
    notes: task?.notes ?? "",
    tags: task?.tags ?? [],
    links: task?.links ?? [],
  };
}

export function TaskDialog({ open, onOpenChange, task, defaults }: TaskDialogProps) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const isEdit = !!task;

  const { register, handleSubmit, control, reset, formState } = useForm<FormValues>({
    defaultValues: taskToForm(task, defaults),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  useEffect(() => {
    if (open) reset(taskToForm(task, defaults));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: TaskInput = {
      title: values.title.trim(),
      description: values.description || undefined,
      category: values.category,
      priority: values.priority as TaskInput["priority"],
      difficulty: (values.difficulty || undefined) as TaskInput["difficulty"],
      scope: values.scope as TaskInput["scope"],
      status: values.status as TaskInput["status"],
      date: values.date ? new Date(values.date).toISOString() : null,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : undefined,
      repeat: values.repeat as TaskInput["repeat"],
      notes: values.notes || undefined,
      tags: values.tags,
      links: values.links.filter((l) => l.label && l.url),
    };

    if (isEdit) await update.mutateAsync({ id: task._id, input: payload });
    else await create.mutateAsync(payload);
    onOpenChange(false);
  });

  const saving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of this task." : "Capture what you need to get done."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" autoFocus placeholder="e.g. Solve 5 medium DP problems" {...register("title", { required: true })} />
            {formState.errors.title && <p className="text-xs text-destructive">Title is required</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} placeholder="Optional details…" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FormSelect control={control} name="category" label="Category">
              {TASK_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </FormSelect>
            <FormSelect control={control} name="priority" label="Priority">
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_META[p].label}
                </SelectItem>
              ))}
            </FormSelect>
            <FormSelect control={control} name="difficulty" label="Difficulty" placeholder="—">
              <SelectItem value="none">None</SelectItem>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d[0].toUpperCase() + d.slice(1)}
                </SelectItem>
              ))}
            </FormSelect>
            <FormSelect control={control} name="status" label="Status">
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </FormSelect>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FormSelect control={control} name="scope" label="Scope">
              {TASK_SCOPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </FormSelect>
            <FormSelect control={control} name="repeat" label="Repeat">
              {REPEAT_RULES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r === "none" ? "Never" : r[0].toUpperCase() + r.slice(1)}
                </SelectItem>
              ))}
            </FormSelect>
            <div className="space-y-1.5">
              <Label htmlFor="date">Scheduled</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="estimatedMinutes">Estimated (minutes)</Label>
              <Input id="estimatedMinutes" type="number" min={0} placeholder="e.g. 60" {...register("estimatedMinutes")} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
              />
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Links</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => append({ label: "", url: "" })}>
                <Plus className="h-4 w-4" /> Add link
              </Button>
            </div>
            {fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input placeholder="Label" className="w-40" {...register(`links.${i}.label`)} />
                <Input placeholder="https://…" {...register(`links.${i}.url`)} />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} placeholder="Anything else…" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner /> : isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Small controlled Select wrapper for RHF. */
function FormSelect({
  control,
  name,
  label,
  children,
  placeholder,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  name: keyof FormValues;
  label: string;
  children: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={(field.value as string) || undefined}
            onValueChange={(v) => field.onChange(v === "none" && name === "difficulty" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder ?? "Select"} />
            </SelectTrigger>
            <SelectContent>{children}</SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
