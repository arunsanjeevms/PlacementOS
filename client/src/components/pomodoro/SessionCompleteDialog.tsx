import { useEffect, useState } from "react";
import { Star, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTimer } from "@/hooks/useTimer";
import { useCreateSession } from "@/hooks/useSessions";
import { MOOD_META } from "@/constants/pomodoro";
import { formatMinutes, cn } from "@/lib/utils";
import type { Mood } from "@/types/session";
import { toast } from "sonner";

export function SessionCompleteDialog() {
  const { pending, resolvePending } = useTimer();
  const create = useCreateSession();
  const [productivity, setProductivity] = useState(4);
  const [mood, setMood] = useState<Mood>("good");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (pending) {
      setProductivity(4);
      setMood("good");
      setNotes("");
    }
  }, [pending]);

  if (!pending) return null;

  const save = async () => {
    await create.mutateAsync({
      category: pending.category,
      task: pending.taskId,
      taskTitle: pending.taskTitle,
      durationMinutes: pending.durationMinutes,
      mode: pending.mode,
      productivity,
      mood,
      notes: notes || undefined,
      startedAt: pending.startedAt,
      endedAt: pending.endedAt,
    });
    toast.success(`Logged ${formatMinutes(pending.durationMinutes)} of focus 🎯`);
    resolvePending();
  };

  return (
    <Dialog open={!!pending} onOpenChange={(o) => !o && resolvePending()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
            <Trophy className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Focus session complete!</DialogTitle>
          <DialogDescription className="text-center">
            {formatMinutes(pending.durationMinutes)} on <span className="font-medium text-foreground">{pending.category}</span>
            {pending.taskTitle ? ` · ${pending.taskTitle}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>How productive were you?</Label>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setProductivity(n)} className="p-1">
                  <Star className={cn("h-8 w-8 transition-colors", n <= productivity ? "fill-warning text-warning" : "text-muted")} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex justify-center gap-2">
              {MOOD_META.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-colors",
                    mood === m.value ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                  )}
                >
                  <span className="text-xl">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you work on?" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={resolvePending}>
            Discard
          </Button>
          <Button variant="gradient" onClick={save} disabled={create.isPending}>
            Save session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
