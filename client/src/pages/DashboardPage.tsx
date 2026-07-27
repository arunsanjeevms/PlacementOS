import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Clock, CheckSquare, Target, Timer, Plus, Sparkles, ArrowRight, Quote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { useAuth } from "@/hooks/useAuth";
import { formatFullDate, getGreeting, getDailyQuote } from "@/lib/date";

const quickActions = [
  { label: "Start Pomodoro", to: "/app/pomodoro", icon: Timer },
  { label: "Add Task", to: "/app/tasks", icon: Plus },
  { label: "DSA Roadmap", to: "/app/dsa", icon: Target },
  { label: "New Note", to: "/app/notes", icon: Sparkles },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const quote = getDailyQuote();
  const firstName = user?.name.split(" ")[0] ?? "there";

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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Streak" value="0 days" icon={<Flame className="h-5 w-5" />} hint="Study today to start one" delay={0.02} />
        <StatCard label="Study Time Today" value="0h 0m" icon={<Clock className="h-5 w-5" />} hint="Goal: 4h" delay={0.06} />
        <StatCard label="Tasks Done Today" value="0 / 0" icon={<CheckSquare className="h-5 w-5" />} hint="Plan your day" delay={0.1} />
        <StatCard label="Total Study Hours" value="0h" icon={<Target className="h-5 w-5" />} hint="All time" delay={0.14} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Placement readiness */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Placement Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressRing value={0} size={160} label="Ready" />
            <p className="text-center text-sm text-muted-foreground">
              Complete your roadmaps, projects and mock interviews to raise your score.
            </p>
          </CardContent>
        </Card>

        {/* Focus of the day / next up */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">What to study next</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/dsa">
                Open roadmap <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              As you add tasks and track topics, PlacementOS will recommend the highest-impact thing to study next.
            </div>
          </CardContent>
        </Card>
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
