export type ProjectStatus = "todo" | "in_progress" | "testing" | "completed";

export interface ChecklistItem {
  _id: string;
  title: string;
  done: boolean;
  dueDate?: string;
}
export interface LinkItem {
  label: string;
  url: string;
}

export interface Project {
  _id: string;
  user: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  githubUrl?: string;
  liveUrl?: string;
  techStack: string[];
  milestones: ChecklistItem[];
  tasks: ChecklistItem[];
  deadline?: string;
  screenshots: string[];
  notes?: string;
  resources: LinkItem[];
  order: number;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  title: string;
  description?: string;
  status?: ProjectStatus;
  githubUrl?: string;
  liveUrl?: string;
  techStack?: string[];
  deadline?: string | null;
  screenshots?: string[];
  notes?: string;
  resources?: LinkItem[];
  pinned?: boolean;
}
