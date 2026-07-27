import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StringListEditor } from "@/components/shared/StringListEditor";
import { Spinner } from "@/components/shared/LoadingScreen";
import { useCreateJournal, useUpdateJournal } from "@/hooks/useJournal";
import { OUTCOMES, OUTCOME_META } from "@/constants/journal";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { JournalEntry, JournalInput, JournalType } from "@/types/journal";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  type: JournalType;
  entry?: JournalEntry | null;
}

interface FormValues {
  company: string;
  role: string;
  date: string;
  round: string;
  interviewer: string;
  mistakes: string;
  feedback: string;
  nextAction: string;
  outcome: string;
}

export function JournalDialog({ open, onOpenChange, type, entry }: Props) {
  const create = useCreateJournal();
  const update = useUpdateJournal();
  const isEdit = !!entry;

  const [asked, setAsked] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(3);

  const { register, handleSubmit, control, reset, formState } = useForm<FormValues>();

  useEffect(() => {
    if (!open) return;
    reset({
      company: entry?.company ?? "",
      role: entry?.role ?? "",
      date: entry?.date ? entry.date.slice(0, 10) : toDateKey(new Date()),
      round: entry?.round ?? "",
      interviewer: entry?.interviewer ?? "",
      mistakes: entry?.mistakes ?? "",
      feedback: entry?.feedback ?? "",
      nextAction: entry?.nextAction ?? "",
      outcome: entry?.outcome ?? "pending",
    });
    setAsked(entry?.questionsAsked ?? []);
    setMissed(entry?.questionsMissed ?? []);
    setConcepts(entry?.conceptsToRevise ?? []);
    setConfidence(entry?.confidence ?? 3);
  }, [open, entry, reset]);

  const onSubmit = handleSubmit(async (v) => {
    const payload: JournalInput = {
      type,
      company: v.company.trim(),
      role: v.role || undefined,
      date: new Date(v.date).toISOString(),
      round: v.round || undefined,
      interviewer: v.interviewer || undefined,
      questionsAsked: asked,
      questionsMissed: missed,
      conceptsToRevise: concepts,
      mistakes: v.mistakes || undefined,
      confidence,
      outcome: v.outcome as JournalInput["outcome"],
      feedback: v.feedback || undefined,
      nextAction: v.nextAction || undefined,
    };
    if (isEdit) await update.mutateAsync({ id: entry._id, input: payload });
    else await create.mutateAsync(payload);
    onOpenChange(false);
  });

  const saving = create.isPending || update.isPending;
  const label = type === "mock" ? "mock interview" : "interview";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${label}` : `Log a ${label}`}</DialogTitle>
          <DialogDescription>Capture what happened so you can learn from every round.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="max-h-[68vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company / Platform</Label>
              <Input id="company" autoFocus placeholder={type === "mock" ? "e.g. Pramp" : "e.g. Amazon"} {...register("company", { required: true })} />
              {formState.errors.company && <p className="text-xs text-destructive">Required</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="SDE Intern" {...register("role")} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="round">Round</Label>
              <Input id="round" placeholder="Technical 1" {...register("round")} />
            </div>
            <div className="space-y-1.5">
              <Label>Outcome</Label>
              <Controller
                control={control}
                name="outcome"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTCOMES.map((o) => (
                        <SelectItem key={o} value={o}>
                          {OUTCOME_META[o].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Questions asked</Label>
            <StringListEditor items={asked} onChange={setAsked} placeholder="Add a question you were asked…" />
          </div>
          <div className="space-y-1.5">
            <Label>Questions you missed</Label>
            <StringListEditor items={missed} onChange={setMissed} placeholder="Add a question you struggled with…" />
          </div>
          <div className="space-y-1.5">
            <Label>Concepts to revise</Label>
            <StringListEditor items={concepts} onChange={setConcepts} placeholder="Add a concept to review…" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mistakes">Mistakes</Label>
            <Textarea id="mistakes" rows={2} placeholder="What went wrong?" {...register("mistakes")} />
          </div>

          <div className="space-y-2">
            <Label>Confidence</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setConfidence(n)}>
                  <Star className={cn("h-6 w-6", n <= confidence ? "fill-warning text-warning" : "text-muted")} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea id="feedback" rows={2} {...register("feedback")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nextAction">Next action</Label>
              <Textarea id="nextAction" rows={2} placeholder="What will you do next?" {...register("nextAction")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner /> : isEdit ? "Save changes" : "Save entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
