import type { Project, ProjectStatus } from "@/types/project";

export const PROJECT_STATUSES: ProjectStatus[] = ["todo", "in_progress", "testing", "completed"];

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; dot: string }> = {
  todo: { label: "To Do", dot: "bg-slate-400" },
  in_progress: { label: "In Progress", dot: "bg-blue-500" },
  testing: { label: "Testing", dot: "bg-amber-500" },
  completed: { label: "Completed", dot: "bg-emerald-500" },
};

/** Progress % from milestones (preferred), else tasks, else status. */
export function projectProgress(project: Project): number {
  const list = project.milestones.length ? project.milestones : project.tasks;
  if (list.length) return Math.round((list.filter((i) => i.done).length / list.length) * 100);
  return project.status === "completed" ? 100 : project.status === "testing" ? 75 : project.status === "in_progress" ? 40 : 0;
}
