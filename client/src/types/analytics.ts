export interface HeatmapDay {
  date: string;
  minutes: number;
  sessions: number;
  tasks: number;
  count: number; // 0–4 intensity
}

export interface DayDetail {
  date: string;
  minutes: number;
  sessions: { _id: string; category: string; durationMinutes: number; startedAt: string; taskTitle?: string }[];
  tasks: { _id: string; title: string; category: string }[];
  notes: { _id: string; title: string }[];
  journal: { _id: string; company: string; round?: string; outcome: string; type: string }[];
}

export interface Statistics {
  studyByDay: { date: string; minutes: number }[];
  categoryDistribution: { category: string; minutes: number }[];
  weekdayMinutes: { day: string; minutes: number }[];
  productiveDay: string;
  totalMinutes: number;
  totalSessions: number;
  longestSession: number;
  avgSession: number;
  pomodoroCount: number;
  completedTasks: number;
  completionRate: number;
}

export interface ReadinessComponent {
  label: string;
  weight: number;
  score: number;
}
export interface Readiness {
  score: number;
  components: ReadinessComponent[];
}

export interface DashboardData {
  streak: { current: number; longest: number };
  study: { todayMinutes: number; weekMinutes: number; monthMinutes: number; totalMinutes: number; totalHours: number };
  tasks: { todayTotal: number; todayDone: number; pending: number };
  upcoming: { _id: string; title: string; deadline: string; priority: string; category: string }[];
  recentResources: { _id: string; title: string; url: string; type: string }[];
  recentProjects: { _id: string; title: string; status: string }[];
  recentNotes: { _id: string; title: string; updatedAt: string }[];
  readiness: Readiness;
  company: { total: number; avgProgress: number };
}

export interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: string;
  target: number;
  progress: number;
  value: number;
  unlocked: boolean;
}
