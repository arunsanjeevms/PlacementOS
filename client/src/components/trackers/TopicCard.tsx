import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Trash2, FileText, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Stepper } from "@/components/shared/Stepper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTopic, useUpdateTopic } from "@/hooks/useTopics";
import type { Topic, TopicPatch, TopicStatus, TrackerKind } from "@/types/topic";
import { cn } from "@/lib/utils";

const STATUS_PILL: Record<TopicStatus, { label: string; className: string }> = {
  not_started: { label: "Not started", className: "bg-muted text-muted-foreground" },
  learning: { label: "Learning", className: "bg-amber-500/15 text-amber-400" },
  completed: { label: "Completed", className: "bg-emerald-500/15 text-emerald-400" },
};

const DIFF_COLOR: Record<"easy" | "medium" | "hard", string> = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-rose-400",
};

export function TopicCard({ kind, topic, onOpenDetail }: { kind: TrackerKind; topic: Topic; onOpenDetail: (t: Topic) => void }) {
  const update = useUpdateTopic(kind);
  const del = useDeleteTopic(kind);
  const [completion, setCompletion] = useState(topic.completion);

  const patch = (p: TopicPatch) => update.mutate({ id: topic._id, patch: p });

  // ---- kind-specific derived status ----
  const dsaSolved = topic.easy.solved + topic.medium.solved + topic.hard.solved;
  const dsaTotal = topic.easy.total + topic.medium.total + topic.hard.total;

  const setDifficulty = (diff: "easy" | "medium" | "hard", key: "solved" | "total", value: number) => {
    const current = topic[diff];
    const nextCount = { ...current, [key]: value };
    if (key === "total" && nextCount.solved > value) nextCount.solved = value;
    const solved = ["easy", "medium", "hard"].reduce(
      (s, d) => s + (d === diff ? nextCount.solved : topic[d as "easy"].solved),
      0
    );
    const total = ["easy", "medium", "hard"].reduce((s, d) => s + (d === diff ? nextCount.total : topic[d as "easy"].total), 0);
    const status: TopicStatus = total > 0 && solved >= total ? "completed" : solved > 0 ? "learning" : "not_started";
    patch({ [diff]: nextCount, status } as TopicPatch);
  };

  const commitCompletion = (v: number) => {
    const status: TopicStatus = v >= 100 ? "completed" : v > 0 ? "learning" : "not_started";
    patch({ completion: v, status });
  };

  const pill = STATUS_PILL[topic.status];

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("card-hover p-4", topic.isWeak && "ring-1 ring-rose-500/30")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => onOpenDetail(topic)} className="truncate text-left text-sm font-semibold hover:text-primary">
              {topic.name}
            </button>
            {topic.isWeak && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", pill.className)}>{pill.label}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onOpenDetail(topic)}>
                  <FileText /> Notes & resources
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => patch({ revisionCount: topic.revisionCount + 1 })}>
                  <RefreshCw /> Log revision ({topic.revisionCount})
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => patch({ isWeak: !topic.isWeak })}>
                  <AlertTriangle /> {topic.isWeak ? "Unmark weak" : "Mark as weak"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => del.mutate(topic._id)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Body */}
        <div className="mt-3">
          {kind === "java" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Completion</span>
                <span className="font-semibold text-foreground">{completion}%</span>
              </div>
              <Slider
                value={[completion]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => setCompletion(v[0])}
                onValueCommit={(v) => commitCompletion(v[0])}
              />
              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>Practice questions</span>
                <Stepper value={topic.practiceQuestions} onChange={(v) => patch({ practiceQuestions: v })} step={5} />
              </div>
            </div>
          )}

          {kind === "dsa" && (
            <div className="space-y-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <div key={d} className="flex items-center justify-between gap-2">
                  <span className={cn("w-16 text-xs font-medium capitalize", DIFF_COLOR[d])}>{d}</span>
                  <div className="flex items-center gap-2">
                    <Stepper value={topic[d].solved} max={topic[d].total} onChange={(v) => setDifficulty(d, "solved", v)} compact />
                    <span className="text-xs text-muted-foreground">/</span>
                    <Stepper value={topic[d].total} min={topic[d].solved} onChange={(v) => setDifficulty(d, "total", v)} compact />
                  </div>
                </div>
              ))}
              <div className="border-t border-border/60 pt-2 text-right text-xs text-muted-foreground">
                Solved <span className="font-semibold text-foreground">{dsaSolved}</span> / {dsaTotal}
              </div>
            </div>
          )}

          {kind === "aptitude" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Solved</span>
                <Stepper value={topic.solved} step={5} onChange={(v) => patch({ solved: v })} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Accuracy %</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={topic.accuracy}
                  onBlur={(e) => patch({ accuracy: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                  className="h-7 w-20 text-center"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Practice (min)</span>
                <Input
                  type="number"
                  min={0}
                  defaultValue={topic.practiceMinutes}
                  onBlur={(e) => patch({ practiceMinutes: Math.max(0, Number(e.target.value) || 0) })}
                  className="h-7 w-20 text-center"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 border-t border-border/60 pt-2 text-xs">
                <Checkbox
                  checked={topic.status === "completed"}
                  onCheckedChange={(c) => patch({ status: c ? "completed" : topic.solved > 0 ? "learning" : "not_started" })}
                  className="h-3.5 w-3.5"
                />
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" /> Mastered
                </span>
              </label>
            </div>
          )}
        </div>

        {topic.revisionCount > 0 && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <RefreshCw className="h-3 w-3" /> {topic.revisionCount} revision{topic.revisionCount > 1 ? "s" : ""}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
