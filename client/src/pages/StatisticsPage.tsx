import { useState } from "react";
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
import { BarChart3, Clock, Timer, Flame, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStatistics } from "@/hooks/useAnalytics";
import { formatMinutes } from "@/lib/utils";

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 365, label: "1 year" },
];

const PIE_COLORS = [
  "hsl(262 83% 62%)",
  "hsl(217 91% 62%)",
  "hsl(160 84% 45%)",
  "hsl(32 95% 55%)",
  "hsl(347 77% 60%)",
  "hsl(189 94% 48%)",
  "hsl(291 64% 60%)",
  "hsl(130 60% 50%)",
];

function ChartTooltip({ active, payload, label, suffix }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-0.5 font-medium">{label}</p>}
      <p className="text-muted-foreground">
        {payload[0].name}: <span className="font-semibold text-foreground">{payload[0].value}{suffix ?? ""}</span>
      </p>
    </div>
  );
}

export default function StatisticsPage() {
  const [range, setRange] = useState(30);
  const { data: stats, isLoading } = useStatistics(range);

  const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
  const studyData = stats?.studyByDay.map((d) => ({ ...d, label: format(new Date(d.date), "MMM d") })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistics"
        description="Understand your study patterns and productivity."
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${range === r.value ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !stats ? null : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total study time" value={formatMinutes(stats.totalMinutes)} icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Pomodoro sessions" value={stats.totalSessions} icon={<Timer className="h-5 w-5" />} />
            <StatCard label="Avg session" value={formatMinutes(stats.avgSession)} icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard label="Longest session" value={formatMinutes(stats.longestSession)} icon={<Flame className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Study time ({range} days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={studyData} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<ChartTooltip suffix="m" />} />
                  <Area type="monotone" dataKey="minutes" name="Minutes" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#studyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subject distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.categoryDistribution.length === 0 ? (
                  <EmptyState icon={<Target className="h-5 w-5" />} title="No sessions yet" className="py-10" />
                ) : (
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <ResponsiveContainer width="100%" height={200} className="max-w-[220px]">
                      <PieChart>
                        <Pie data={stats.categoryDistribution} dataKey="minutes" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
                          {stats.categoryDistribution.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip suffix="m" />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {stats.categoryDistribution.slice(0, 8).map((c, i) => (
                        <div key={c.category} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {c.category}
                          </span>
                          <span className="text-muted-foreground">{formatMinutes(c.minutes)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">By weekday · most productive: {stats.productiveDay}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.weekdayMinutes} margin={{ left: -20, top: 8 }}>
                    <XAxis dataKey="day" tick={axisStyle} tickLine={false} axisLine={false} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={40} />
                    <Tooltip content={<ChartTooltip suffix="m" />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
                    <Bar dataKey="minutes" name="Minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Tasks completed" value={stats.completedTasks} />
            <StatCard label="Completion rate" value={`${stats.completionRate}%`} />
            <StatCard label="Pomodoros" value={stats.pomodoroCount} />
          </div>
        </>
      )}
    </div>
  );
}
