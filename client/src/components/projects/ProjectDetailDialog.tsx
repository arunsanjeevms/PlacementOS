import { useState, type KeyboardEvent } from "react";
import { Github, ExternalLink, Trash2, Pencil, Flag, ListChecks } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProjectChecklist, useDeleteProject } from "@/hooks/useProjects";
import { projectProgress, PROJECT_STATUS_META } from "@/constants/projects";
import { cn } from "@/lib/utils";
import type { ChecklistItem, Project } from "@/types/project";

interface Props {
  project: Project | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: (p: Project) => void;
}

function Checklist({ project, field, icon, label }: { project: Project; field: "milestones" | "tasks"; icon: React.ReactNode; label: string }) {
  const { add, toggle, remove } = useProjectChecklist();
  const [draft, setDraft] = useState("");
  const items = project[field];

  const submit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && draft.trim()) {
      add.mutate({ id: project._id, field, title: draft.trim() });
      setDraft("");
    }
  };

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        {icon} {label}
        <span className="text-xs font-normal text-muted-foreground">
          {items.filter((i) => i.done).length}/{items.length}
        </span>
      </p>
      <div className="space-y-1">
        {items.map((item: ChecklistItem) => (
          <div key={item._id} className="group flex items-center gap-2">
            <Checkbox checked={item.done} onCheckedChange={() => toggle.mutate({ id: project._id, field, itemId: item._id })} className="h-4 w-4" />
            <span className={cn("flex-1 text-sm", item.done && "text-muted-foreground line-through")}>{item.title}</span>
            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100" onClick={() => remove.mutate({ id: project._id, field, itemId: item._id })}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
      <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={submit} placeholder={`Add ${label.toLowerCase().slice(0, -1)}…`} className="h-8 text-sm" />
    </div>
  );
}

export function ProjectDetailDialog({ project, open, onOpenChange, onEdit }: Props) {
  const del = useDeleteProject();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!project) return null;

  const meta = PROJECT_STATUS_META[project.status];
  const progress = projectProgress(project);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
              <DialogTitle>{project.title}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}

            <div className="flex flex-wrap items-center gap-2">
              {project.githubUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" /> Code
                  </a>
                </Button>
              )}
              {project.liveUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> Live
                  </a>
                </Button>
              )}
              {project.deadline && (
                <span className="text-xs text-muted-foreground">Due {format(new Date(project.deadline), "MMM d, yyyy")}</span>
              )}
            </div>

            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((t) => (
                  <span key={t} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-semibold text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Checklist project={project} field="milestones" icon={<Flag className="h-4 w-4 text-primary" />} label="Milestones" />
              <Checklist project={project} field="tasks" icon={<ListChecks className="h-4 w-4 text-primary" />} label="Tasks" />
            </div>

            {project.resources.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Resources</p>
                {project.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> {r.label}
                  </a>
                ))}
              </div>
            )}

            {project.notes && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground whitespace-pre-wrap">{project.notes}</div>
            )}

            <div className="flex justify-between border-t border-border pt-4">
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <Button variant="outline" onClick={() => { onOpenChange(false); onEdit(project); }}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete project?"
        description={`"${project.title}" and all its milestones will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          del.mutate(project._id);
          onOpenChange(false);
        }}
      />
    </>
  );
}
