import { useMemo, useState } from "react";
import { Bookmark, Search, Star, Pin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceDialog } from "@/components/resources/ResourceDialog";
import { useResources } from "@/hooks/useResources";
import { useDebounce } from "@/hooks/useDebounce";
import type { Resource } from "@/types/resource";

export default function BookmarksPage() {
  const [tab, setTab] = useState<"favorite" | "pinned">("favorite");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const debounced = useDebounce(search, 300);

  const params = useMemo(
    () => ({ [tab]: true, search: debounced || undefined, limit: 300 }),
    [tab, debounced]
  );
  const { data: resources = [], isLoading } = useResources(params);

  return (
    <div className="space-y-6">
      <PageHeader title="Bookmarks" description="Your pinned and favorite resources, one click away." icon={<Bookmark className="h-5 w-5" />} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="favorite">
              <Star className="h-4 w-4" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="pinned">
              <Pin className="h-4 w-4" /> Pinned
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmarks…" className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-6 w-6" />}
          title={`No ${tab} resources`}
          description={`Star or pin resources from the Resources page and they'll show up here.`}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard key={r._id} resource={r} selected={false} onSelect={() => {}} onEdit={(res) => { setEditing(res); setDialogOpen(true); }} />
          ))}
        </div>
      )}

      <ResourceDialog open={dialogOpen} onOpenChange={setDialogOpen} resource={editing} />
    </div>
  );
}
