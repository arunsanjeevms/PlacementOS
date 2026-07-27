import { useState, type KeyboardEvent } from "react";
import { Pencil, Trash2, Plus, MapPin, Wallet, CalendarClock, GraduationCap, X } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { COMPANY_STATUS_META, ROUND_STATUS_META } from "@/constants/companies";
import { useDeleteCompany, useUpdateCompany, useRoundMutations } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && draft.trim()) {
      onChange([...items, draft.trim()]);
      setDraft("");
    }
  };
  return (
    <div className="space-y-1.5">
      <div className="space-y-1">
        {items.map((q, i) => (
          <div key={i} className="group flex items-start gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5 text-sm">
            <span className="flex-1">{q}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
      <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={add} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );
}

export function CompanyDetailDialog({ company, open, onOpenChange, onEdit }: { company: Company | null; open: boolean; onOpenChange: (o: boolean) => void; onEdit: (c: Company) => void }) {
  const update = useUpdateCompany();
  const del = useDeleteCompany();
  const rounds = useRoundMutations();
  const [confirm, setConfirm] = useState(false);
  const [newRound, setNewRound] = useState("");

  if (!company) return null;
  const meta = COMPANY_STATUS_META[company.status];
  const patch = (input: Record<string, unknown>) => update.mutate({ id: company._id, input });

  const cycleRound = (roundId: string, status: string) => {
    const next = status === "pending" ? "cleared" : status === "cleared" ? "failed" : "pending";
    rounds.update.mutate({ id: company._id, roundId, patch: { status: next as "pending" } });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pr-6">
              <div className="flex items-center gap-2">
                <DialogTitle>{company.name}</DialogTitle>
                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", meta.className)}>{meta.label}</span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => { onOpenChange(false); onEdit(company); }}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            {company.role && <p className="text-sm text-muted-foreground">{company.role}</p>}
          </DialogHeader>

          <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {company.ctc && <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {company.ctc}</span>}
              {company.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {company.location}</span>}
              {company.interviewDate && <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {format(new Date(company.interviewDate), "MMM d, yyyy")}</span>}
              {company.eligibility && <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {company.eligibility}</span>}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Preparation progress</span>
                <span className="font-semibold">{company.preparationProgress}%</span>
              </div>
              <Slider value={[company.preparationProgress]} min={0} max={100} step={5} onValueCommit={(v) => patch({ preparationProgress: v[0] })} />
            </div>

            {/* Rounds */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Interview rounds</p>
              <div className="space-y-1.5">
                {company.rounds.map((r) => {
                  const rmeta = ROUND_STATUS_META[r.status];
                  return (
                    <div key={r._id} className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                      <button onClick={() => cycleRound(r._id, r.status)} className={cn("text-xs font-medium", rmeta.className)}>
                        ● {rmeta.label}
                      </button>
                      <span className="flex-1 text-sm">{r.name}</span>
                      <button onClick={() => rounds.remove.mutate({ id: company._id, roundId: r._id })} className="opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newRound.trim()) {
                      rounds.add.mutate({ id: company._id, round: { name: newRound.trim() } });
                      setNewRound("");
                    }
                  }}
                  placeholder="Add a round (e.g. Technical 1)…"
                  className="h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => {
                    if (newRound.trim()) {
                      rounds.add.mutate({ id: company._id, round: { name: newRound.trim() } });
                      setNewRound("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {company.oaPattern && (
              <div className="space-y-1">
                <p className="text-sm font-semibold">OA pattern</p>
                <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground whitespace-pre-wrap">{company.oaPattern}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Technical questions</p>
              <StringListEditor items={company.technicalQuestions} onChange={(v) => patch({ technicalQuestions: v })} placeholder="Add a technical question…" />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold">HR questions</p>
              <StringListEditor items={company.hrQuestions} onChange={(v) => patch({ hrQuestions: v })} placeholder="Add an HR question…" />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Notes</p>
              <Textarea defaultValue={company.notes} rows={3} onBlur={(e) => patch({ notes: e.target.value })} placeholder="Anything else to remember…" />
            </div>

            <div className="flex justify-between border-t border-border pt-4">
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirm(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <Button variant="outline" onClick={() => { onOpenChange(false); onEdit(company); }}>
                <Pencil className="h-4 w-4" /> Edit details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Remove company?"
        description={`"${company.name}" and all its rounds will be deleted.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          del.mutate(company._id);
          onOpenChange(false);
        }}
      />
    </>
  );
}
