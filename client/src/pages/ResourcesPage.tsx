import { useMemo, useRef, useState } from "react";
import { Library, Plus, Search, Upload, Download, Star, CheckCircle2, Trash2, X, Pin, FolderInput } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceDialog } from "@/components/resources/ResourceDialog";
import { StatCard } from "@/components/shared/StatCard";
import { useResources, useResourceSummary, useBulkResources, useImportResources } from "@/hooks/useResources";
import { resourcesService } from "@/services/resources.service";
import { useDebounce } from "@/hooks/useDebounce";
import { RESOURCE_TYPES, RESOURCE_TYPE_META } from "@/constants/resources";
import type { BulkAction, Resource } from "@/types/resource";

const SORTS = [
  { value: "createdAt", label: "Recently added" },
  { value: "title", label: "Title A–Z" },
  { value: "rating", label: "Rating" },
];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      type: type === "all" ? undefined : type,
      sort,
      order: (sort === "title" ? "asc" : "desc") as "asc" | "desc",
      limit: 300,
    }),
    [debouncedSearch, type, sort]
  );

  const { data: resources = [], isLoading } = useResources(params);
  const { data: summary } = useResourceSummary();
  const bulk = useBulkResources();
  const importMut = useImportResources();

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const runBulk = (action: BulkAction, folder?: string) => {
    bulk.mutate({ ids: [...selected], action, folder }, { onSuccess: clearSelection });
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (r: Resource) => {
    setEditing(r);
    setDialogOpen(true);
  };

  const exportJson = async () => {
    const all = await resourcesService.exportAll();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placementos-resources-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${all.length} resources`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed) ? parsed : parsed.resources;
        if (!Array.isArray(list)) throw new Error("Invalid file");
        importMut.mutate(list.map((r: Record<string, unknown>) => ({ title: r.title, url: r.url, description: r.description, type: r.type, category: r.category, difficulty: r.difficulty, tags: r.tags, notes: r.notes, folder: r.folder, rating: r.rating })) as never);
      } catch {
        toast.error("Could not parse the file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Your library of every useful placement-prep resource."
        icon={<Library className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={exportJson}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="gradient" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total resources" value={summary?.total ?? 0} icon={<Library className="h-5 w-5" />} />
        <StatCard label="Completed" value={summary?.completed ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Favorites" value={summary?.favorites ?? 0} icon={<Star className="h-5 w-5" />} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources…" className="pl-9" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {RESOURCE_TYPE_META[t].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked onCheckedChange={clearSelection} />
            {selected.size} selected
          </span>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button variant="ghost" size="sm" onClick={() => runBulk("favorite")}>
            <Star className="h-4 w-4" /> Favorite
          </Button>
          <Button variant="ghost" size="sm" onClick={() => runBulk("pin")}>
            <Pin className="h-4 w-4" /> Pin
          </Button>
          <Button variant="ghost" size="sm" onClick={() => runBulk("complete")}>
            <CheckCircle2 className="h-4 w-4" /> Complete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const folder = window.prompt("Move to folder");
              if (folder !== null) runBulk("move", folder);
            }}
          >
            <FolderInput className="h-4 w-4" /> Move
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runBulk("delete")}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={clearSelection} className="ml-auto">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<Library className="h-6 w-6" />}
          title="No resources yet"
          description="Save your first cheat sheet, playlist or problem set."
          action={
            <Button variant="gradient" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add resource
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard key={r._id} resource={r} selected={selected.has(r._id)} onSelect={toggleSelect} onEdit={openEdit} />
          ))}
        </div>
      )}

      <ResourceDialog open={dialogOpen} onOpenChange={setDialogOpen} resource={editing} />
    </div>
  );
}
