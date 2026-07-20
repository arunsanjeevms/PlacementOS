export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type TaskScope = "DAILY" | "WEEKLY" | "MONTHLY";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
export type Repeat = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
export type ProjectStatus = "TODO" | "IN_PROGRESS" | "TESTING" | "COMPLETED";
export type CompanyStage = "WISHLIST" | "PREPARING" | "APPLIED" | "ONLINE_ASSESSMENT" | "INTERVIEW" | "OFFER" | "REJECTED";
export type Track = "JAVA" | "DSA" | "APTITUDE";

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  order: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  difficulty: Difficulty;
  scope: TaskScope;
  status: TaskStatus;
  estimateMin: number;
  actualMin: number;
  deadline: string | null;
  scheduledFor: string | null;
  repeat: Repeat;
  tags: string[];
  links: string[];
  notes: string;
  order: number;
  completedDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  attachments: Attachment[];
}

export interface StudySession {
  id: string;
  taskId: string | null;
  task?: { id: string; title: string } | null;
  startedAt: string;
  endedAt: string | null;
  durationMin: number;
  dateKey: string;
  subject: string;
  preset: string;
  isPomodoro: boolean;
  notes: string;
  mood: string;
  productivity: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  done: boolean;
  dueDate: string | null;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  deployment: string;
  deadline: string | null;
  notes: string;
  order: number;
  milestones: Milestone[];
  createdAt: string;
}

export interface CompanyRound {
  name: string;
  status: string;
  notes?: string;
}

export interface Company {
  id: string;
  name: string;
  stage: CompanyStage;
  eligibility: string;
  ctc: string;
  oaPattern: string;
  rounds: CompanyRound[];
  questions: { question: string; topic?: string; link?: string }[];
  resources: { title: string; url: string }[];
  preparation: number;
  resumeStatus: string;
  applied: boolean;
  interviewDate: string | null;
  notes: string;
  favorite: boolean;
  updatedAt: string;
}

export interface Resource {
  id: string;
  siteName: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  favorite: boolean;
  pinned: boolean;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
}

export interface Bookmark {
  id: string;
  noteId: string | null;
  title: string;
  url: string;
  kind: string;
  tags: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  folderId: string | null;
  title: string;
  content: string;
  category: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  taskId: string | null;
  projectId: string | null;
  companyId: string | null;
  revisionDate: string | null;
  createdAt: string;
  updatedAt: string;
  bookmarks: Bookmark[];
}

export interface TopicProgress {
  id: string;
  track: Track;
  topic: string;
  progress: number;
  solvedEasy: number;
  solvedMed: number;
  solvedHard: number;
  solved: number;
  accuracy: number;
  avgTimeSec: number;
  revisions: number;
  weak: boolean;
  notes: string;
  bookmarks: { title: string; url: string }[];
  resources: { title: string; url: string }[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  category: "HR" | "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CODING";
  company: string;
  difficulty: Difficulty;
  mastered: boolean;
  favorite: boolean;
  createdAt: string;
}

export interface MockInterview {
  id: string;
  date: string;
  type: string;
  company: string;
  rating: number;
  notes: string;
}

export interface Settings {
  id: string;
  theme: string;
  accentColor: string;
  timezone: string;
  dailyGoalHours: number;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  morningEmail: boolean;
  nightEmail: boolean;
  inactivityEmail: boolean;
  emailFrequency: string;
  targetRole: string;
}

export interface StatsSummary {
  streaks: { current: number; longest: number };
  todayMinutes: number;
  todayTasksDone: number;
  weekMinutes: number;
  monthMinutes: number;
  weekTasks: number;
  monthTasks: number;
  totalMinutes: number;
  totalTasksDone: number;
  totalSessions: number;
}

export interface HeatmapDay {
  dateKey: string;
  minutes: number;
  tasksDone: number;
  sessions: number;
}

export interface AchievementItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  metric: string;
  value: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface ChartsData {
  daily: { date: string; minutes: number; tasks: number }[];
  categories: { name: string; minutes: number }[];
  taskCategories: { name: string; count: number }[];
  weekday: { day: number; minutes: number }[];
  pomodoroCount: number;
  longestSessionMin: number;
  avgSessionMin: number;
  totalSessions: number;
  totalMinutes: number;
  totalTasksDone: number;
}

export interface Readiness {
  readiness: number;
  breakdown: {
    java: number;
    dsa: number;
    aptitude: number;
    companyPrep: number;
    projects: number;
    consistency: number;
    mocks: number;
  };
}

export interface SearchResults {
  tasks: Pick<Task, "id" | "title" | "category" | "status" | "scope">[];
  notes: Pick<Note, "id" | "title" | "category">[];
  projects: Pick<Project, "id" | "title" | "status">[];
  resources: Pick<Resource, "id" | "title" | "url" | "type">[];
  companies: Pick<Company, "id" | "name" | "stage">[];
  bookmarks: Pick<Bookmark, "id" | "title" | "url" | "kind">[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  demoMode: boolean;
  settings: Settings | null;
}
