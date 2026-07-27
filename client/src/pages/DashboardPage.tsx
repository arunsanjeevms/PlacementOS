import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Clock,
  CheckSquare,
  Target,
  Timer,
  Plus,
  Sparkles,
  ArrowRight,
  Quote,
  CalendarClock,
  Library,
  FolderKanban,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useAnalytics";
import { formatFullDate, getGreeting, getDailyQuote } from "@/lib/date";
import { formatMinutes } from "@/lib/utils";
import { format } from "date-fns";

const quickActions = [
  { label: "Start Pomodoro", to: "/app/pomodoro", icon: Timer },
  { label: "Add Task", to: "/app/tasks", icon: Plus },
  { label: "DSA Roadmap", to: "/app/dsa", icon: Target },
  { label: "New Note", to: "/app/notes", icon: Sparkles },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();
  const quote = getDailyQuote();
  const firstName = user?.name.split(" ")[0] ?? "there";

  const goalHours = user?.preferences.dailyGoalHours ?? 4;
  const todayMin = data?.study.todayMinutes ?? 0;
  const goalPct = Math.min(100, Math.round((todayMin / (goalHours * 60)) * 100));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 lg:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <p className="text-sm text-muted-foreground">{formatFullDate()}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Here's your placement command center. Let's answer the only question that matters today —{" "}
          <span className="font-medium text-foreground">what should you study next?</span>
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Button key={a.to} asChild variant="outline" size="sm" className="bg-card/60">
              <Link to={a.to}>
                <a.icon className="h-4 w-4" /> {a.label}
              </Link>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Current Streak" value={`${data?.streak.current ?? 0} days`} icon={<Flame className="h-5 w-5" />} hint={`Longest: ${data?.streak.longest ?? 0} days`} delay={0.02} />
          <StatCard label="Study Time Today" value={formatMinutes(todayMin)} icon={<Clock className="h-5 w-5" />} hint={`Goal: ${goalHours}h`} delay={0.06} />
          <StatCard label="Tasks Done Today" value={`${data?.tasks.todayDone ?? 0} / ${data?.tasks.todayTotal ?? 0}`} icon={<CheckSquare className="h-5 w-5" />} hint={`${data?.tasks.pending ?? 0} pending`} delay={0.1} />
          <StatCard label="Total Study Hours" value={`${data?.study.totalHours ?? 0}h`} icon={<Target className="h-5 w-5" />} hint="All time" delay={0.14} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Placement readiness */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Placement Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressRing value={data?.readiness.score ?? 0} size={150} label="Ready" />
            <div className="w-full space-y-1.5">
              {data?.readiness.components.slice(0, 4).map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0 text-muted-foreground">{c.label}</span>
                  <Progress value={c.score} className="h-1.5 flex-1" />
                  <span className="w-8 text-right text-muted-foreground">{c.score}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's goal progress + upcoming */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Today's study goal</CardTitle>
              <span className="text-sm text-muted-foreground">
                {formatMinutes(todayMin)} / {goalHours}h
              </span>
            </CardHeader>
            <CardContent>
              <Progress value={goalPct} className="h-2.5" />
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">This week</p>
                  <p className="font-semibold">{formatMinutes(data?.study.weekMinutes ?? 0)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">This month</p>
                  <p className="font-semibold">{formatMinutes(data?.study.monthMinutes ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-primary" /> Upcoming deadlines
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/tasks">
                  All tasks <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data?.upcoming.length ? (
                <div className="space-y-2">
                  {data.upcoming.map((t) => (
                    <div key={t._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span className="truncate">{t.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{format(new Date(t.deadline), "MMM d")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No upcoming deadlines. You're on top of it! 🎉</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent items */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentList title="Recent Notes" icon={<FileText className="h-4 w-4 text-primary" />} to="/app/notes" items={(data?.recentNotes ?? []).map((n) => ({ id: n._id, label: n.title || "Untitled" }))} />
        <RecentList title="Recent Resources" icon={<Library className="h-4 w-4 text-primary" />} to="/app/resources" items={(data?.recentResources ?? []).map((r) => ({ id: r._id, label: r.title, url: r.url }))} />
        <RecentList title="Recent Projects" icon={<FolderKanban className="h-4 w-4 text-primary" />} to="/app/projects" items={(data?.recentProjects ?? []).map((p) => ({ id: p._id, label: p.title }))} />
      </div>

      {/* Daily quote */}
      <Card className="bg-gradient-to-r from-card to-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <Quote className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="text-base font-medium italic">"{quote.text}"</p>
            <p className="mt-1 text-sm text-muted-foreground">— {quote.author}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentList({ title, icon, to, items }: { title: string; icon: React.ReactNode; to: string; items: { id: string; label: string; url?: string }[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
        <Button asChild variant="ghost" size="icon-sm">
          <Link to={to}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="space-y-1">
            {items.map((it) =>
              it.url ? (
                <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="block truncate rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  {it.label}
                </a>
              ) : (
                <Link key={it.id} to={to} className="block truncate rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                  {it.label}
                </Link>
              )
            )}
          </div>
        ) : (
          <p className="py-3 text-center text-xs text-muted-foreground">Nothing yet</p>
        )}
      </CardContent>
    </Card>
  );
}
