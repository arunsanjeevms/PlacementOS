import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Clock,
  CheckSquare,
  Target,
  Play,
  ArrowRight,
  Quote,
  CalendarClock,
  Sparkles,
  Coffee,
  Binary,
  Calculator,
  FolderKanban,
  Mic,
  Building2,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useAnalytics";
import { useTimer } from "@/hooks/useTimer";
import { formatFullDate, getGreeting, getDailyQuote } from "@/lib/date";
import { formatMinutes } from "@/lib/utils";
import { format, isToday, isTomorrow } from "date-fns";
import type { LucideIcon } from "lucide-react";

/** Maps a readiness component to the module it should send you to. */
const FOCUS_MAP: Record<string, { to: string; subject?: string; icon: LucideIcon; verb: string }> = {
  DSA: { to: "/app/dsa", subject: "DSA", icon: Binary, verb: "Grind DSA" },
  Java: { to: "/app/java", subject: "Java", icon: Coffee, verb: "Study Java" },
  Aptitude: { to: "/app/aptitude", subject: "Aptitude", icon: Calculator, verb: "Practice Aptitude" },
  Projects: { to: "/app/projects", icon: FolderKanban, verb: "Build your project" },
  Interviews: { to: "/app/mocks", subject: "Interview", icon: Mic, verb: "Do a mock interview" },
  "Study Hours": { to: "/app/pomodoro", subject: "DSA", icon: Timer, verb: "Put in focused hours" },
  Consistency: { to: "/app/pomodoro", subject: "DSA", icon: Flame, verb: "Keep your streak alive" },
  Applications: { to: "/app/companies", icon: Building2, verb: "Apply to companies" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();
  const { setCategory } = useTimer();
  const navigate = useNavigate();
  const quote = getDailyQuote();
  const firstName = user?.name.split(" ")[0] ?? "there";

  const goalHours = user?.preferences.dailyGoalHours ?? 4;
  const todayMin = data?.study.todayMinutes ?? 0;
  const goalPct = Math.min(100, Math.round((todayMin / (goalHours * 60)) * 100));

  // The weakest readiness area = what to study next (ties broken by weight).
  const focusArea = useMemo(() => {
    const comps = data?.readiness.components ?? [];
    if (!comps.length) return null;
    return [...comps].sort((a, b) => a.score - b.score || b.weight - a.weight)[0];
  }, [data]);

  const focus = focusArea ? FOCUS_MAP[focusArea.label] ?? FOCUS_MAP.DSA : FOCUS_MAP.DSA;
  const FocusIcon = focus.icon;
  const nextDeadline = data?.upcoming[0];
  const streakAtRisk = (data?.streak.current ?? 0) > 0 && todayMin === 0;

  const reason = !data
    ? ""
    : focusArea && focusArea.score < 40
      ? `It's your weakest area right now (${focusArea.score}% ready) — the highest-impact place to spend your next hour.`
      : `You're building momentum here. A focused session keeps it climbing.`;

  const startFocus = () => {
    if (focus.subject) setCategory(focus.subject);
    navigate("/app/pomodoro");
  };

  return (
    <div className="space-y-6">
      {/* ---------- Hero: what to study next ---------- */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-border bg-gradient-to-br from-primary/10 via-card to-card">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <CardContent className="relative flex flex-col gap-8 p-6 lg:flex-row lg:items-center lg:p-8">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">{formatFullDate()}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {getGreeting()}, {firstName} 👋
              </h1>

              {isLoading ? (
                <Skeleton className="mt-5 h-28 w-full max-w-md rounded-xl" />
              ) : (
                <div className="mt-5 max-w-lg rounded-2xl border border-primary/20 bg-background/50 p-4 backdrop-blur">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Study next
                  </p>
                  <div className="mt-2 flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                      <FocusIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold leading-tight">{focus.verb}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{reason}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="gradient" size="sm" onClick={startFocus}>
                      <Play className="h-4 w-4" /> Start focus session
                    </Button>
                    <Button asChild variant="outline" size="sm" className="bg-card/60">
                      <Link to={focus.to}>
                        Open <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Contextual nudges */}
              {!isLoading && (streakAtRisk || nextDeadline) && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {streakAtRisk && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 font-medium text-warning">
                      <Flame className="h-3.5 w-3.5" /> {data?.streak.current}-day streak at risk — study today to keep it
                    </span>
                  )}
                  {nextDeadline && (
                    <Link to="/app/tasks" className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground hover:text-foreground">
                      <CalendarClock className="h-3.5 w-3.5" /> Due {deadlineLabel(nextDeadline.deadline)}: {nextDeadline.title}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Readiness ring */}
            <div className="flex shrink-0 flex-col items-center gap-2 lg:w-52">
              {isLoading ? (
                <Skeleton className="h-40 w-40 rounded-full" />
              ) : (
                <>
                  <ProgressRing value={data?.readiness.score ?? 0} size={150} label="Ready" />
                  <p className="text-sm font-medium text-muted-foreground">Placement readiness</p>
                  {focusArea && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      Weakest: <span className="font-medium text-foreground">{focusArea.label}</span>
                    </span>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ---------- Stat tiles ---------- */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Current Streak" value={`${data?.streak.current ?? 0} days`} icon={<Flame className="h-5 w-5" />} hint={`Longest: ${data?.streak.longest ?? 0} days`} delay={0.02} />
          <StatCard label="Study Today" value={formatMinutes(todayMin)} icon={<Clock className="h-5 w-5" />} hint={`${goalPct}% of ${goalHours}h goal`} delay={0.06} />
          <StatCard label="Tasks Today" value={`${data?.tasks.todayDone ?? 0} / ${data?.tasks.todayTotal ?? 0}`} icon={<CheckSquare className="h-5 w-5" />} hint={`${data?.tasks.pending ?? 0} pending`} delay={0.1} />
          <StatCard label="Total Hours" value={`${data?.study.totalHours ?? 0}h`} icon={<Target className="h-5 w-5" />} hint="All time" delay={0.14} />
        </div>
      )}

      {/* ---------- Two focused panels ---------- */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Today's study goal</CardTitle>
            <span className="text-sm text-muted-foreground">{formatMinutes(todayMin)} / {goalHours}h</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={goalPct} className="h-2.5" />
            <div className="grid grid-cols-3 gap-3 text-sm">
              <MiniStat label="Today" value={formatMinutes(todayMin)} />
              <MiniStat label="This week" value={formatMinutes(data?.study.weekMinutes ?? 0)} />
              <MiniStat label="This month" value={formatMinutes(data?.study.monthMinutes ?? 0)} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" /> Deadlines
            </CardTitle>
            <Button asChild variant="ghost" size="icon-sm">
              <Link to="/app/tasks">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.upcoming.length ? (
              <div className="space-y-2">
                {data.upcoming.slice(0, 4).map((t) => (
                  <div key={t._id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="truncate">{t.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{deadlineLabel(t.deadline)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-6 text-center">
                <CheckSquare className="h-6 w-6 text-success" />
                <p className="text-sm text-muted-foreground">No deadlines this week — you're on top of it.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- Quote ---------- */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-5 py-3">
        <Quote className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm italic text-muted-foreground">
          "{quote.text}" <span className="not-italic">— {quote.author}</span>
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function deadlineLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "today";
  if (isTomorrow(d)) return "tomorrow";
  return format(d, "MMM d");
}
