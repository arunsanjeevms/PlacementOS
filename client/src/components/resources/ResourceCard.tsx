import { ExternalLink, Copy, MoreHorizontal, Pencil, Trash2, Pin, Star, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RESOURCE_TYPE_META } from "@/constants/resources";
import { useDeleteResource, useUpdateResource } from "@/hooks/useResources";
import { cn } from "@/lib/utils";
import type { Resource } from "@/types/resource";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface Props {
  resource: Resource;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (r: Resource) => void;
}

export function ResourceCard({ resource, selected, onSelect, onEdit }: Props) {
  const update = useUpdateResource();
  const del = useDeleteResource();
  const meta = RESOURCE_TYPE_META[resource.type];
  const Icon = meta.icon;

  const copy = () => {
    navigator.clipboard.writeText(resource.url);
    toast.success("Link copied");
  };

  return (
    <div className={cn("group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40", selected && "ring-2 ring-primary/40")}>
      <div className="flex items-start gap-3">
        <div className="absolute left-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 data-[checked=true]:opacity-100" data-checked={selected}>
          <Checkbox checked={selected} onCheckedChange={(c) => onSelect(resource._id, !!c)} />
        </div>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `hsl(${meta.hue} 70% 55% / 0.15)`, color: `hsl(${meta.hue} 70% 60%)` }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <a href={resource.url} target="_blank" rel="noreferrer" className="line-clamp-2 text-sm font-semibold hover:text-primary">
              {resource.title}
            </a>
            <div className="flex items-center gap-0.5">
              {resource.pinned && <Pin className="h-3.5 w-3.5 fill-primary text-primary" />}
              {resource.favorite && <Star className="h-3.5 w-3.5 fill-warning text-warning" />}
            </div>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{hostOf(resource.url)}</p>
        </div>
      </div>

      {resource.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{resource.description}</p>}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{meta.label}</span>
        {resource.difficulty && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{resource.difficulty}</span>
        )}
        {resource.tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
        <button
          onClick={() => update.mutate({ id: resource._id, input: { completed: !resource.completed } })}
          className={cn("flex items-center gap-1 text-xs", resource.completed ? "text-success" : "text-muted-foreground hover:text-foreground")}
        >
          {resource.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
          {resource.completed ? "Completed" : "Mark done"}
        </button>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild>
            <a href={resource.url} target="_blank" rel="noreferrer" title="Open">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={copy} title="Copy link">
            <Copy className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(resource)}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => update.mutate({ id: resource._id, input: { favorite: !resource.favorite } })}>
                <Star /> {resource.favorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => update.mutate({ id: resource._id, input: { pinned: !resource.pinned } })}>
                <Pin /> {resource.pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => del.mutate(resource._id)}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
