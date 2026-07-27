import { CalendarClock, CheckCircle2, FileCheck2 } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { COMPANY_STATUS_META } from "@/constants/companies";
import { initials, cn } from "@/lib/utils";
import type { Company } from "@/types/company";

export function CompanyCard({ company, onClick }: { company: Company; onClick: () => void }) {
  const meta = COMPANY_STATUS_META[company.status];
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-sm font-bold text-primary">
          {initials(company.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{company.name}</p>
          {company.role && <p className="truncate text-xs text-muted-foreground">{company.role}</p>}
        </div>
        <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium", meta.className)}>{meta.label}</span>
      </div>

      {company.ctc && <p className="mt-2 text-xs text-muted-foreground">💰 {company.ctc}</p>}

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Prep progress</span>
          <span className="font-semibold text-foreground">{company.preparationProgress}%</span>
        </div>
        <Progress value={company.preparationProgress} className="h-1.5" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {company.resumeSent && (
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <FileCheck2 className="h-3 w-3" /> Resume sent
          </span>
        )}
        {company.applied && (
          <span className="inline-flex items-center gap-1 text-blue-400">
            <CheckCircle2 className="h-3 w-3" /> Applied
          </span>
        )}
        {company.interviewDate && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> {format(new Date(company.interviewDate), "MMM d")}
          </span>
        )}
      </div>
    </button>
  );
}
