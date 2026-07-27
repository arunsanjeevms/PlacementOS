import { Github, ExternalLink, ListChecks, CalendarClock, Pin } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { projectProgress } from "@/constants/projects";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

export function ProjectCard({ project, onClick, dragging }: { project: Project; onClick?: () => void; dragging?: boolean }) {
  const progress = projectProgress(project);
  const doneMilestones = project.milestones.filter((m) => m.done).length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer select-none rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-primary/40",
        dragging && "rotate-1 shadow-xl ring-2 ring-primary/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug">{project.title}</p>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {project.pinned && <Pin className="h-3.5 w-3.5 fill-primary text-primary" />}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {project.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>}

      {project.techStack.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {project.techStack.slice(0, 5).map((t) => (
            <span key={t} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {t}
            </span>
          ))}
          {project.techStack.length > 5 && <span className="text-[10px] text-muted-foreground">+{project.techStack.length - 5}</span>}
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {project.milestones.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <ListChecks className="h-3 w-3" /> {doneMilestones}/{project.milestones.length} milestones
          </span>
        )}
        {project.deadline && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> {format(new Date(project.deadline), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
