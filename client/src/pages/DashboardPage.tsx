import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Flame,
  Clock,
  CheckSquare,
  Target,
  ArrowRight,
  CalendarClock,
  Timer,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard, useStatistics } from "@/hooks/useAnalytics";
import { formatFullDate, getGreeting } from "@/lib/date";
import { formatMinutes, cn } from "@/lib/utils";
import { format, isToday, isTomorrow } from "date-fns";

const PIE_COLORS = [
  "hsl(262 83% 62%)",
  "hsl(217 91% 62%)",
  "hsl(160 84% 45%)",
  "hsl(32 95% 55%)",
  "hsl(347 77% 60%)",
  "hsl(189 94% 48%)",
];

const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

function ChartTip({ active, payload, label, suffix = "m" }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-0.5 font-medium">{label}</p>}
      <p className="text-muted-foreground">
        {payload[0].name}: <span className="font-semibold text-foreground">{payload[0].value}{suffix}</span>
      </p>
    </div>
  );
}

function deadlineLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "today";
  if (isTomorrow(d)) return "tomorrow";
  return format(d, "MMM d");
}

interface TileProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  delay?: number;
  highlight?: boolean;
}

function StatTile({ label, value, sub, icon, delay = 0, highlight }: TileProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.25 }}>
      <div className={cn("rounded-xl border border-border bg-card p-4", highlight && "border-primary/30 bg-primary/5")}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <span className="text-primary">{icon}</span>
        </div>
        <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();
  const { data: stats, isLoading: statsLoading } = useStatistics(30);
  const firstName = user?.name.split(" ")[0] ?? "there";

  const goalHours = user?.preferences.dailyGoalHours ?? 4;
  const todayMin = data?.study.todayMinutes ?? 0;
  const goalPct = Math.min(100, Math.round((todayMin / (goalHours * 60)) * 100));

  const studyData = useMemo(
    () => (stats?.studyByDay ?? []).map((d) => ({ ...d, label: format(new Date(d.date), "d MMM") })),
    [stats]
  );
  const last7 = useMemo(() => studyData.slice(-7).reduce((s, d) => s + d.minutes, 0), [studyData]);
  const topCategories = stats?.categoryDistribution.slice(0, 6) ?? [];

  const loading = isLoading || statsLoading;

  return (
    <div className="space-y-5">
      {/* ---------- Header ---------- */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{formatFullDate()}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/app/stats">
              <BarChart3 className="h-4 w-4" /> Full statistics
            </Link>
          </Button>
          <Button asChild variant="gradient" size="sm">
            <Link to="/app/pomodoro">
              <Timer className="h-4 w-4" /> Start focus
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* ---------- Stat tiles ---------- */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatTile label="Streak" value={`${data?.streak.current ?? 0}d`} sub={`best ${data?.streak.longest ?? 0}d`} icon={<Flame className="h-4 w-4" />} delay={0.02} highlight={(data?.streak.current ?? 0) > 0} />
          <StatTile label="Today" value={formatMinutes(todayMin)} sub={`${goalPct}% of ${goalHours}h goal`} icon={<Clock className="h-4 w-4" />} delay={0.05} />
          <StatTile label="Last 7 days" value={formatMinutes(last7)} sub={`avg ${formatMinutes(Math.round(last7 / 7))}/day`} icon={<TrendingUp className="h-4 w-4" />} delay={0.08} />
          <StatTile label="Tasks today" value={`${data?.tasks.todayDone ?? 0}/${data?.tasks.todayTotal ?? 0}`} sub={`${data?.tasks.pending ?? 0} open total`} icon={<CheckSquare className="h-4 w-4" />} delay={0.11} />
          <StatTile label="Sessions" value={stats?.totalSessions ?? 0} sub={`avg ${formatMinutes(stats?.avgSession ?? 0)}`} icon={<Timer className="h-4 w-4" />} delay={0.14} />
          <StatTile label="All time" value={`${data?.study.totalHours ?? 0}h`} sub={`${stats?.completionRate ?? 0}% task completion`} icon={<Target className="h-4 w-4" />} delay={0.17} />
        </div>
      )}

      {/* ---------- Main chart row ---------- */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Study trend */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Study time — last 30 days</CardTitle>
            <span className="text-sm text-muted-foreground">{formatMinutes(stats?.totalMinutes ?? 0)} total</span>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-[220px] w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={studyData} margin={{ left: -22, right: 4, top: 6 }}>
                  <defs>
                    <linearGradient id="dashStudy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={38} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="minutes" name="Minutes" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#dashStudy)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Readiness */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Placement readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            {isLoading ? (
              <Skeleton className="h-32 w-32 rounded-full" />
            ) : (
              <>
                <ProgressRing value={data?.readiness.score ?? 0} size={120} label="Ready" />
                <div className="w-full space-y-1.5">
                  {(data?.readiness.components ?? []).slice(0, 5).map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      <span className="w-24 shrink-0 truncate text-muted-foreground">{c.label}</span>
                      <Progress value={c.score} className="h-1.5 flex-1" />
                      <span className="w-8 text-right tabular-nums text-muted-foreground">{c.score}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- Secondary row ---------- */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Subjects */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subjects — 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-[180px] w-full rounded-lg" />
            ) : topCategories.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No sessions yet — start a Pomodoro.</p>
            ) : (
              <div className="flex items-center gap-3">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={topCategories} dataKey="minutes" nameKey="category" innerRadius={36} outerRadius={56} paddingAngle={2}>
                      {topCategories.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="min-w-0 flex-1 space-y-1">
                  {topCategories.map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="truncate">{c.category}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">{formatMinutes(c.minutes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekday rhythm */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Weekly rhythm{stats?.productiveDay && stats.productiveDay !== "—" ? ` · best: ${stats.productiveDay}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-[180px] w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats?.weekdayMinutes ?? []} margin={{ left: -22, top: 6 }}>
                  <XAxis dataKey="day" tick={axisStyle} tickLine={false} axisLine={false} />
                  <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={38} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
                  <Bar dataKey="minutes" name="Minutes" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
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
                {data.upcoming.slice(0, 5).map((t) => (
                  <div key={t._id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="truncate">{t.title}</span>
                    <span className={cn("shrink-0 text-xs", isToday(new Date(t.deadline)) ? "font-medium text-warning" : "text-muted-foreground")}>
                      {deadlineLabel(t.deadline)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-8 text-center">
                <CheckSquare className="h-6 w-6 text-success" />
                <p className="text-sm text-muted-foreground">Nothing due this week.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
