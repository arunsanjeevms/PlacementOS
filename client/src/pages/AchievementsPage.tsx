import { Trophy, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { useAchievements } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const { data: achievements = [], isLoading } = useAchievements();
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" description="Celebrate your placement-prep milestones." icon={<Trophy className="h-5 w-5" />} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Unlocked" value={`${unlocked} / ${achievements.length}`} icon={<Trophy className="h-5 w-5" />} />
        <StatCard label="Completion" value={`${achievements.length ? Math.round((unlocked / achievements.length) * 100) : 0}%`} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={cn("relative overflow-hidden", a.unlocked ? "border-primary/40" : "opacity-90")}>
                {a.unlocked && <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={cn("grid h-12 w-12 place-items-center rounded-xl text-2xl", a.unlocked ? "bg-primary/12" : "bg-muted grayscale")}>
                      {a.unlocked ? a.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    {a.unlocked && <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">UNLOCKED</span>}
                  </div>
                  <h3 className="mt-3 font-semibold">{a.label}</h3>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                  {!a.unlocked && (
                    <div className="mt-3 space-y-1">
                      <Progress value={a.progress} className="h-1.5" />
                      <p className="text-right text-[11px] text-muted-foreground">
                        {a.value} / {a.target}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
