import { useState } from "react";
import { Flame, Clock, CheckSquare, FileText, NotebookPen } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { Heatmap } from "@/components/analytics/Heatmap";
import { useHeatmap, useDayDetail } from "@/hooks/useAnalytics";
import { formatMinutes } from "@/lib/utils";

export default function HeatmapPage() {
  const { data: heatmap = [], isLoading } = useHeatmap(365);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const { data: detail } = useDayDetail(selectedDay);

  const activeDays = heatmap.filter((d) => d.count > 0).length;
  const totalMinutes = heatmap.reduce((s, d) => s + d.minutes, 0);
  const totalTasks = heatmap.reduce((s, d) => s + d.tasks, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Heatmap" description="Your study consistency over the last year." icon={<Flame className="h-5 w-5" />} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active days" value={activeDays} icon={<Flame className="h-5 w-5" />} />
        <StatCard label="Study time" value={formatMinutes(totalMinutes)} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Tasks completed" value={totalTasks} icon={<CheckSquare className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contribution graph</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-32 w-full" /> : <Heatmap data={heatmap} onSelectDay={setSelectedDay} />}
        </CardContent>
      </Card>

      {selectedDay && detail && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{format(new Date(selectedDay), "EEEE, MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {formatMinutes(detail.minutes)} studied across {detail.sessions.length} session{detail.sessions.length !== 1 ? "s" : ""}
            </p>

            {detail.sessions.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Study sessions
                </p>
                <div className="space-y-1">
                  {detail.sessions.map((s) => (
                    <div key={s._id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-sm">
                      <span>{s.taskTitle || s.category}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(s.startedAt), "h:mm a")} · {formatMinutes(s.durationMinutes)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.tasks.length > 0 && (
              <DetailList icon={<CheckSquare className="h-3.5 w-3.5" />} title="Completed tasks" items={detail.tasks.map((t) => t.title)} />
            )}
            {detail.notes.length > 0 && (
              <DetailList icon={<FileText className="h-3.5 w-3.5" />} title="Notes edited" items={detail.notes.map((n) => n.title || "Untitled")} />
            )}
            {detail.journal.length > 0 && (
              <DetailList icon={<NotebookPen className="h-3.5 w-3.5" />} title="Interviews" items={detail.journal.map((j) => `${j.company}${j.round ? ` · ${j.round}` : ""}`)} />
            )}

            {detail.minutes === 0 && detail.tasks.length === 0 && detail.notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity recorded on this day.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </p>
      <ul className="list-disc space-y-0.5 pl-5 text-sm">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
