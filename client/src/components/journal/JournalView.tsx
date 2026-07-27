import { useMemo, useState, type ReactNode } from "react";
import { Plus, Search, Star, ChevronDown, Pencil, Trash2, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalDialog } from "./JournalDialog";
import { useJournal, useDeleteJournal } from "@/hooks/useJournal";
import { useDebounce } from "@/hooks/useDebounce";
import { OUTCOME_META } from "@/constants/journal";
import { cn } from "@/lib/utils";
import type { JournalEntry, JournalType } from "@/types/journal";

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="list-disc space-y-0.5 pl-4 text-sm">
        {items.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
}

function JournalCard({ entry, onEdit }: { entry: JournalEntry; onEdit: (e: JournalEntry) => void }) {
  const [open, setOpen] = useState(false);
  const del = useDeleteJournal();
  const outcome = OUTCOME_META[entry.outcome];

  return (
    <div className="rounded-xl border border-border bg-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4 text-left">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{entry.company}</p>
            <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", outcome.className)}>{outcome.label}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {[entry.role, entry.round].filter(Boolean).join(" · ")} · {format(new Date(entry.date), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-0.5 text-warning">
          {Array.from({ length: entry.confidence }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-4 py-3">
          <Section title="Questions asked" items={entry.questionsAsked} />
          <Section title="Questions missed" items={entry.questionsMissed} />
          <Section title="Concepts to revise" items={entry.conceptsToRevise} />
          {entry.mistakes && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mistakes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.mistakes}</p>
            </div>
          )}
          {entry.feedback && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feedback</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.feedback}</p>
            </div>
          )}
          {entry.nextAction && (
            <div className="rounded-lg bg-primary/8 p-2.5 text-sm">
              <span className="font-medium text-primary">Next: </span>
              {entry.nextAction}
            </div>
          )}
          <div className="flex justify-end gap-1 pt-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => del.mutate(entry._id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface JournalViewProps {
  type: JournalType;
  title: string;
  description: string;
  icon: ReactNode;
  emptyLabel: string;
}

export function JournalView({ type, title, description, icon, emptyLabel }: JournalViewProps) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);

  const params = useMemo(() => ({ type, search: debounced || undefined }), [type, debounced]);
  const { data: entries = [], isLoading } = useJournal(params);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by company or round…" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title={emptyLabel} description="Log your interviews to spot patterns and improve faster." action={<Button variant="gradient" onClick={openCreate}><Plus className="h-4 w-4" /> New Entry</Button>} />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <JournalCard key={e._id} entry={e} onEdit={(en) => { setEditing(en); setDialogOpen(true); }} />
          ))}
        </div>
      )}

      <JournalDialog open={dialogOpen} onOpenChange={setDialogOpen} type={type} entry={editing} />
    </div>
  );
}
