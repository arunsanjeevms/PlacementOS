import { useState, type KeyboardEvent, type ReactNode } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { TopicCard } from "./TopicCard";
import { TopicDetailDialog } from "./TopicDetailDialog";
import { useCreateTopic, useTopics, useTrackerSummary } from "@/hooks/useTopics";
import { formatMinutes } from "@/lib/utils";
import type { Topic, TrackerKind } from "@/types/topic";

interface TrackerConfig {
  kind: TrackerKind;
  title: string;
  description: string;
  icon: ReactNode;
}

function SummaryStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function TrackerPage({ kind, title, description, icon }: TrackerConfig) {
  const { data: topics = [], isLoading } = useTopics(kind);
  const { data: summary } = useTrackerSummary(kind);
  const create = useCreateTopic(kind);

  const [newTopic, setNewTopic] = useState("");
  const [detail, setDetail] = useState<Topic | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (t: Topic) => {
    setDetail(t);
    setDetailOpen(true);
  };

  const addTopic = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTopic.trim()) {
      create.mutate(newTopic.trim());
      setNewTopic("");
    }
  };

  const weakTopics = topics.filter((t) => t.isWeak);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} icon={icon} />

      {/* Summary */}
      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row md:items-center">
          <ProgressRing value={summary?.progress ?? 0} size={130} label="Progress" />
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="Topics" value={`${summary?.completedTopics ?? 0}/${summary?.totalTopics ?? 0}`} />
            {kind === "dsa" && <SummaryStat label="Problems solved" value={`${summary?.solved ?? 0}/${summary?.total ?? 0}`} />}
            {kind === "dsa" && summary?.byDifficulty && (
              <SummaryStat
                label="E / M / H"
                value={
                  <span className="text-base">
                    <span className="text-emerald-400">{summary.byDifficulty.easy.solved}</span> /{" "}
                    <span className="text-amber-400">{summary.byDifficulty.medium.solved}</span> /{" "}
                    <span className="text-rose-400">{summary.byDifficulty.hard.solved}</span>
                  </span>
                }
              />
            )}
            {(kind === "java" || kind === "core") && (
              <SummaryStat label="Practice Qs" value={topics.reduce((s, t) => s + t.practiceQuestions, 0)} />
            )}
            {kind === "aptitude" && <SummaryStat label="Solved" value={summary?.totalSolved ?? 0} />}
            {kind === "aptitude" && <SummaryStat label="Avg accuracy" value={`${summary?.avgAccuracy ?? 0}%`} />}
            {kind === "aptitude" && <SummaryStat label="Practice" value={formatMinutes(summary?.practiceMinutes ?? 0)} />}
            <SummaryStat label="Weak areas" value={summary?.weakTopics ?? 0} />
          </div>
        </CardContent>
      </Card>

      {/* Weak areas */}
      {weakTopics.length > 0 && (
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardContent className="flex flex-wrap items-center gap-2 p-4">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-400">
              <AlertTriangle className="h-4 w-4" /> Weak areas to revise:
            </span>
            {weakTopics.map((t) => (
              <Badge key={t._id} variant="destructive" className="cursor-pointer" onClick={() => openDetail(t)}>
                {t.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add topic */}
      <div className="relative max-w-md">
        <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={addTopic} placeholder="Add a custom topic and press Enter…" className="pl-9" />
      </div>

      {/* Topics grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <EmptyState icon={icon} title="No topics yet" description="Add your first topic above to start tracking progress." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <TopicCard key={t._id} kind={kind} topic={t} onOpenDetail={openDetail} />
          ))}
        </div>
      )}

      <TopicDetailDialog kind={kind} topic={detail} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
