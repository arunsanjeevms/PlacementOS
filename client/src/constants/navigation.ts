import {
  LayoutDashboard,
  Sun,
  CheckSquare,
  CalendarRange,
  CalendarDays,
  Timer,
  Coffee,
  Binary,
  Calculator,
  Database,
  FolderKanban,
  NotebookPen,
  Mic,
  Building2,
  Library,
  FileText,
  Bookmark,
  Calendar,
  Flame,
  BarChart3,
  Trophy,
  User as UserIcon,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", to: "/app", icon: LayoutDashboard },
      { label: "Today", to: "/app/today", icon: Sun },
    ],
  },
  {
    heading: "Plan",
    items: [
      { label: "Tasks", to: "/app/tasks", icon: CheckSquare },
      { label: "Weekly Planner", to: "/app/weekly", icon: CalendarRange },
      { label: "Monthly Planner", to: "/app/monthly", icon: CalendarDays },
      { label: "Calendar", to: "/app/calendar", icon: Calendar },
    ],
  },
  {
    heading: "Focus",
    items: [{ label: "Pomodoro", to: "/app/pomodoro", icon: Timer }],
  },
  {
    heading: "Learn",
    items: [
      { label: "Java Roadmap", to: "/app/java", icon: Coffee },
      { label: "DSA Roadmap", to: "/app/dsa", icon: Binary },
      { label: "Aptitude", to: "/app/aptitude", icon: Calculator },
      { label: "CS Fundamentals", to: "/app/core", icon: Database },
    ],
  },
  {
    heading: "Build & Prepare",
    items: [
      { label: "Projects", to: "/app/projects", icon: FolderKanban },
      { label: "Interview Journal", to: "/app/journal", icon: NotebookPen },
      { label: "Mock Interviews", to: "/app/mocks", icon: Mic },
      { label: "Company Tracker", to: "/app/companies", icon: Building2 },
    ],
  },
  {
    heading: "Library",
    items: [
      { label: "Resources", to: "/app/resources", icon: Library },
      { label: "Notes", to: "/app/notes", icon: FileText },
      { label: "Bookmarks", to: "/app/bookmarks", icon: Bookmark },
    ],
  },
  {
    heading: "Insights",
    items: [
      { label: "Heatmap", to: "/app/heatmap", icon: Flame },
      { label: "Statistics", to: "/app/stats", icon: BarChart3 },
      { label: "Achievements", to: "/app/achievements", icon: Trophy },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Profile", to: "/app/profile", icon: UserIcon },
      { label: "Settings", to: "/app/settings", icon: SettingsIcon },
    ],
  },
];

/** Flat list for the command palette and search. */
export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
