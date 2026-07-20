export const TASK_CATEGORIES = [
  "Java",
  "DSA",
  "Aptitude",
  "Projects",
  "Resume",
  "Interview",
  "Communication",
  "System Design",
  "CS Fundamentals",
  "Custom",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Java: "#f97316",
  DSA: "#8b5cf6",
  Aptitude: "#06b6d4",
  Projects: "#10b981",
  Resume: "#eab308",
  Interview: "#ec4899",
  Communication: "#3b82f6",
  "System Design": "#f43f5e",
  "CS Fundamentals": "#14b8a6",
  Custom: "#64748b",
  General: "#64748b",
};

export const categoryColor = (name: string) => CATEGORY_COLORS[name] ?? "#64748b";

export const PRIORITY_META: Record<string, { label: string; color: string; ring: string }> = {
  URGENT: { label: "Urgent", color: "text-red-400", ring: "bg-red-500" },
  HIGH: { label: "High", color: "text-orange-400", ring: "bg-orange-500" },
  MEDIUM: { label: "Medium", color: "text-blue-400", ring: "bg-blue-500" },
  LOW: { label: "Low", color: "text-slate-400", ring: "bg-slate-500" },
};

export const DIFFICULTY_META: Record<string, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  MEDIUM: { label: "Medium", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  HARD: { label: "Hard", className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export const TIMER_PRESETS = [
  { id: "25/5", label: "25 / 5", focusMin: 25, breakMin: 5 },
  { id: "45/10", label: "45 / 10", focusMin: 45, breakMin: 10 },
  { id: "60/10", label: "60 / 10", focusMin: 60, breakMin: 10 },
  { id: "90/20", label: "90 / 20", focusMin: 90, breakMin: 20 },
] as const;

export const RESOURCE_TYPES = [
  { value: "WEBSITE", label: "Website" },
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "YOUTUBE_PLAYLIST", label: "YouTube Playlist" },
  { value: "COURSE", label: "Course" },
  { value: "GITHUB_REPO", label: "GitHub Repo" },
  { value: "LEETCODE_PROBLEM", label: "LeetCode Problem" },
  { value: "ARTICLE", label: "Article" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "CHEAT_SHEET", label: "Cheat Sheet" },
  { value: "PRACTICE_PLATFORM", label: "Practice Platform" },
  { value: "COMPANY_PREP", label: "Company Prep" },
] as const;

export const COMPANY_STAGES = [
  { value: "WISHLIST", label: "Wishlist", color: "#64748b" },
  { value: "PREPARING", label: "Preparing", color: "#8b5cf6" },
  { value: "APPLIED", label: "Applied", color: "#3b82f6" },
  { value: "ONLINE_ASSESSMENT", label: "Online Assessment", color: "#06b6d4" },
  { value: "INTERVIEW", label: "Interview", color: "#f59e0b" },
  { value: "OFFER", label: "Offer", color: "#10b981" },
  { value: "REJECTED", label: "Rejected", color: "#ef4444" },
] as const;

export const QUOTES = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "Consistency is what transforms average into excellence.", author: "Tony Robbins" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "Your limitation — it's only your imagination.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
] as const;

export const quoteOfTheDay = () => {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
};

export const ACCENT_COLORS = [
  { id: "violet", color: "#8b5cf6" },
  { id: "blue", color: "#3b82f6" },
  { id: "cyan", color: "#06b6d4" },
  { id: "emerald", color: "#10b981" },
  { id: "amber", color: "#f59e0b" },
  { id: "rose", color: "#f43f5e" },
  { id: "orange", color: "#f97316" },
] as const;

export const bookmarkKind = (url: string): string => {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("github.com")) return "github";
  if (u.includes("leetcode.com")) return "leetcode";
  if (u.includes("geeksforgeeks.org")) return "gfg";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("drive.google.com")) return "drive";
  if (u.includes("docs.") || u.includes("documentation")) return "docs";
  return "link";
};
