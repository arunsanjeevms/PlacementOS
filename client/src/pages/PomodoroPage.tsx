import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Maximize2, Minimize2, Timer as TimerIcon, Flame, Clock, Trophy, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SessionCompleteDialog } from "@/components/pomodoro/SessionCompleteDialog";
import { useTimer } from "@/hooks/useTimer";
import { useSessions, useSessionSummary, useDeleteSession } from "@/hooks/useSessions";
import { useTasks } from "@/hooks/useTasks";
import { POMODORO_PRESETS, PHASE_META, MOOD_META } from "@/constants/pomodoro";
import { TASK_CATEGORIES } from "@/constants/tasks";
import { formatClock, formatMinutes, cn } from "@/lib/utils";
import { toDateKey } from "@/lib/date";
import { format } from "date-fns";

function TimerRing({ progress, phaseColor, children }: { progress: number; phaseColor: string; children: React.ReactNode }) {
  const size = 300;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-secondary" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={phaseColor}
          strokeDasharray={c}
          animate={{ strokeDashoffset: c - (progress / 100) * c }}
          transition={{ duration: 0.4, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export default function PomodoroPage() {
  const timer = useTimer();
  const [fullscreen, setFullscreen] = useState(false);
  const todayKey = toDateKey(new Date());
  const { data: sessions = [] } = useSessions({ from: todayKey, to: todayKey });
  const { data: summary } = useSessionSummary();
  const { data: openTasks = [] } = useTasks({ status: "todo", limit: 100 });
  const del = useDeleteSession();

  const progress = timer.totalSeconds ? ((timer.totalSeconds - timer.secondsLeft) / timer.totalSeconds) * 100 : 0;
  const phaseColor = PHASE_META[timer.phase].color;
  const running = timer.status === "running";

  const todayMinutes = useMemo(() => sessions.reduce((sum, s) => sum + s.durationMinutes, 0), [sessions]);

  const TimerControls = (
    <div className="flex items-center justify-center gap-3">
      <Button variant="outline" size="icon" onClick={timer.reset} aria-label="Reset">
        <RotateCcw className="h-5 w-5" />
      </Button>
      <Button
        variant="gradient"
        size="lg"
        className="h-14 w-40 text-base"
        onClick={running ? timer.pause : timer.start}
      >
        {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        {running ? "Pause" : timer.status === "paused" ? "Resume" : "Start"}
      </Button>
      <Button variant="outline" size="icon" onClick={timer.skip} aria-label="Skip">
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );

  const TimerDisplay = (
    <TimerRing progress={progress} phaseColor={phaseColor}>
      <div className="text-center">
        <p className="mb-1 text-sm font-medium uppercase tracking-widest" style={{ color: phaseColor }}>
          {PHASE_META[timer.phase].label}
        </p>
        <p className="font-mono text-6xl font-bold tabular-nums">{formatClock(timer.secondsLeft)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Round {timer.cycle + (timer.phase === "focus" ? 1 : 0)} · {timer.category}
        </p>
      </div>
    </TimerRing>
  );

  // ---- Fullscreen focus mode ----
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-background">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 50% 40%, ${phaseColor}22, transparent 60%)` }} />
        <div className="relative">{TimerDisplay}</div>
        <div className="relative">{TimerControls}</div>
        <Button variant="ghost" className="relative" onClick={() => setFullscreen(false)}>
          <Minimize2 className="h-4 w-4" /> Exit focus mode
        </Button>
        <SessionCompleteDialog />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pomodoro"
        description="Deep-focus study timer. Every completed session is logged automatically."
        icon={<TimerIcon className="h-5 w-5" />}
        actions={
          <Button variant="outline" onClick={() => setFullscreen(true)}>
            <Maximize2 className="h-4 w-4" /> Focus mode
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timer */}
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col items-center gap-8 py-10">
            {TimerDisplay}
            {TimerControls}

            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-2">
              {POMODORO_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => timer.setPreset(p.key)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    timer.presetKey === p.key ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                  )}
                >
                  {p.focus}/{p.shortBreak}
                  <span className="ml-1.5 text-xs text-muted-foreground">{p.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session setup + stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={timer.category} onValueChange={timer.setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Linked task (optional)</Label>
                <Select
                  value={timer.taskId ?? "none"}
                  onValueChange={(v) => {
                    if (v === "none") timer.setTask(undefined);
                    else {
                      const t = openTasks.find((x) => x._id === v);
                      if (t) timer.setTask({ id: t._id, title: t.title });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No task</SelectItem>
                    {openTasks.slice(0, 50).map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {timer.presetKey === "custom" && (
                <div className="grid grid-cols-3 gap-2">
                  {(["focus", "shortBreak", "longBreak"] as const).map((k) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-xs capitalize">{k === "shortBreak" ? "Short" : k === "longBreak" ? "Long" : "Focus"}</Label>
                      <Input
                        type="number"
                        min={1}
                        value={timer.durations[k]}
                        onChange={(e) =>
                          timer.setCustom({
                            focus: timer.durations.focus,
                            shortBreak: timer.durations.shortBreak,
                            longBreak: timer.durations.longBreak,
                            [k]: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant={timer.presetKey === "custom" ? "secondary" : "ghost"}
                size="sm"
                className="w-full"
                onClick={() => timer.setCustom({ focus: timer.durations.focus, shortBreak: timer.durations.shortBreak, longBreak: timer.durations.longBreak })}
              >
                Custom timer
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Today" value={formatMinutes(todayMinutes)} icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Streak" value={`${summary?.currentStreak ?? 0}d`} icon={<Flame className="h-5 w-5" />} />
          </div>
        </div>
      </div>

      {/* Today's sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" /> Today's sessions
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {sessions.length} · {formatMinutes(todayMinutes)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <EmptyState icon={<TimerIcon className="h-5 w-5" />} title="No sessions yet today" description="Start the timer to log your first focus session." className="py-8" />
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => {
                const mood = MOOD_META.find((m) => m.value === s.mood);
                return (
                  <div key={s._id} className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/12 text-sm font-semibold text-primary">
                      {formatMinutes(s.durationMinutes)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.taskTitle || s.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.startedAt), "h:mm a")} · {s.category}
                        {s.productivity ? ` · ${"★".repeat(s.productivity)}` : ""}
                      </p>
                    </div>
                    {mood && <span className="text-lg">{mood.emoji}</span>}
                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100" onClick={() => del.mutate(s._id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SessionCompleteDialog />
    </div>
  );
}
