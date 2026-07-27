import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/shared/TagInput";
import { Spinner } from "@/components/shared/LoadingScreen";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { PROJECT_STATUSES, PROJECT_STATUS_META } from "@/constants/projects";
import type { Project, ProjectInput, ProjectStatus } from "@/types/project";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  project?: Project | null;
  defaultStatus?: ProjectStatus;
}

interface FormValues {
  title: string;
  description: string;
  status: ProjectStatus;
  githubUrl: string;
  liveUrl: string;
  deadline: string;
  notes: string;
  techStack: string[];
  resources: { label: string; url: string }[];
}

function toForm(project?: Project | null, defaultStatus?: ProjectStatus): FormValues {
  return {
    title: project?.title ?? "",
    description: project?.description ?? "",
    status: project?.status ?? defaultStatus ?? "todo",
    githubUrl: project?.githubUrl ?? "",
    liveUrl: project?.liveUrl ?? "",
    deadline: project?.deadline ? project.deadline.slice(0, 10) : "",
    notes: project?.notes ?? "",
    techStack: project?.techStack ?? [],
    resources: project?.resources ?? [],
  };
}

export function ProjectDialog({ open, onOpenChange, project, defaultStatus }: Props) {
  const create = useCreateProject();
  const update = useUpdateProject();
  const isEdit = !!project;

  const { register, handleSubmit, control, reset, formState } = useForm<FormValues>({ defaultValues: toForm(project, defaultStatus) });
  const { fields, append, remove } = useFieldArray({ control, name: "resources" });

  useEffect(() => {
    if (open) reset(toForm(project, defaultStatus));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  const onSubmit = handleSubmit(async (v) => {
    const payload: ProjectInput = {
      title: v.title.trim(),
      description: v.description || undefined,
      status: v.status,
      githubUrl: v.githubUrl || undefined,
      liveUrl: v.liveUrl || undefined,
      deadline: v.deadline ? new Date(v.deadline).toISOString() : null,
      notes: v.notes || undefined,
      techStack: v.techStack,
      resources: v.resources.filter((r) => r.label && r.url),
    };
    if (isEdit) await update.mutateAsync({ id: project._id, input: payload });
    else await create.mutateAsync(payload);
    onOpenChange(false);
  });

  const saving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>Track a portfolio or placement project end to end.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" autoFocus placeholder="e.g. PlacementOS" {...register("title", { required: true })} />
            {formState.errors.title && <p className="text-xs text-destructive">Title is required</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {PROJECT_STATUS_META[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" placeholder="https://github.com/…" {...register("githubUrl")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input id="liveUrl" placeholder="https://…" {...register("liveUrl")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tech stack</Label>
            <Controller control={control} name="techStack" render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="Add tech…" />} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Resources</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => append({ label: "", url: "" })}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input placeholder="Label" className="w-36" {...register(`resources.${i}.label`)} />
                <Input placeholder="https://…" {...register(`resources.${i}.url`)} />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner /> : isEdit ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
