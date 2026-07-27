import { useMemo, useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { CompanyDetailDialog } from "@/components/companies/CompanyDetailDialog";
import { useCompanies, useCompanySummary } from "@/hooks/useCompanies";
import { useDebounce } from "@/hooks/useDebounce";
import { COMPANY_STATUSES, COMPANY_STATUS_META } from "@/constants/companies";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

export default function CompaniesPage() {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [detail, setDetail] = useState<Company | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const params = useMemo(() => ({ status: status === "all" ? undefined : status, search: debounced || undefined }), [status, debounced]);
  const { data: companies = [], isLoading } = useCompanies(params);
  const { data: summary } = useCompanySummary();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openDetail = (c: Company) => {
    setDetail(c);
    setDetailOpen(true);
  };

  // Keep the detail dialog in sync with fresh data.
  const liveDetail = detail ? companies.find((c) => c._id === detail._id) ?? detail : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Tracker"
        description="Track every company from wishlist to offer."
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Companies" value={summary?.total ?? 0} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Applied" value={summary?.applied ?? 0} />
        <StatCard label="Avg prep" value={`${summary?.avgProgress ?? 0}%`} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatus("all")}
            className={cn("rounded-lg border px-2.5 py-1.5 text-xs font-medium", status === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent")}
          >
            All
          </button>
          {COMPANY_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn("rounded-lg border px-2.5 py-1.5 text-xs font-medium", status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent")}
            >
              {COMPANY_STATUS_META[s].label}
              {summary?.byStatus[s] ? <span className="ml-1 opacity-60">{summary.byStatus[s]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No companies yet"
          description="Add companies you're targeting to track prep, rounds and questions."
          action={
            <Button variant="gradient" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Company
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <CompanyCard key={c._id} company={c} onClick={() => openDetail(c)} />
          ))}
        </div>
      )}

      <CompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} company={editing} />
      <CompanyDetailDialog
        company={liveDetail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(c) => {
          setEditing(c);
          setDialogOpen(true);
        }}
      />
    </div>
  );
}
