import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, BookMarked, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateTopic } from "@/hooks/useTopics";
import type { LinkItem, Topic, TrackerKind } from "@/types/topic";

interface Props {
  kind: TrackerKind;
  topic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopicDetailDialog({ kind, topic, open, onOpenChange }: Props) {
  const update = useUpdateTopic(kind);
  const [notes, setNotes] = useState("");
  const [bookmarks, setBookmarks] = useState<LinkItem[]>([]);
  const [resources, setResources] = useState<LinkItem[]>([]);

  useEffect(() => {
    if (topic) {
      setNotes(topic.notes ?? "");
      setBookmarks(topic.bookmarks ?? []);
      setResources(topic.resources ?? []);
    }
  }, [topic]);

  if (!topic) return null;

  const save = async () => {
    await update.mutateAsync({
      id: topic._id,
      patch: {
        notes,
        bookmarks: bookmarks.filter((b) => b.label && b.url),
        resources: resources.filter((r) => r.label && r.url),
      },
    });
    onOpenChange(false);
  };

  const LinkEditor = ({
    title,
    icon,
    items,
    setItems,
  }: {
    title: string;
    icon: React.ReactNode;
    items: LinkItem[];
    setItems: (v: LinkItem[]) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          {icon} {title}
        </Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setItems([...items, { label: "", url: "" }])}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Label"
            className="w-36"
            value={item.label}
            onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
          />
          <Input
            placeholder="https://…"
            value={item.url}
            onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
          />
          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{topic.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key concepts, formulas, gotchas…" />
          </div>
          <LinkEditor title="Bookmarks" icon={<BookMarked className="h-4 w-4" />} items={bookmarks} setItems={setBookmarks} />
          <LinkEditor title="Resources" icon={<Link2 className="h-4 w-4" />} items={resources} setItems={setResources} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={save} disabled={update.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
