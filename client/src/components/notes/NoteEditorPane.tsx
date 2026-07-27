import { useEffect, useRef, useState } from "react";
import {
  Pin,
  Star,
  Archive,
  Trash2,
  RotateCcw,
  Link2,
  Loader2,
  Check,
  FolderInput,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/shared/TagInput";
import { RichEditor } from "./RichEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBacklinks, useFolders, useNote, useNoteMutations } from "@/hooks/useNotes";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved";

export function NoteEditorPane({ noteId, onSelectNote }: { noteId: string; onSelectNote: (id: string) => void }) {
  const { data: note } = useNote(noteId);
  const { data: folders = [] } = useFolders();
  const { data: backlinks = [] } = useBacklinks(noteId);
  const { update, remove } = useNoteMutations();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [save, setSave] = useState<SaveState>("idle");
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (note && note._id !== loadedRef.current) {
      loadedRef.current = note._id;
      setTitle(note.title);
      setContent(note.content);
      setText(note.contentText);
      setTags(note.tags);
      setSave("idle");
    }
  }, [note]);

  // Debounced autosave.
  useEffect(() => {
    if (!note || note._id !== loadedRef.current) return;
    const changed =
      title !== note.title || content !== note.content || JSON.stringify(tags) !== JSON.stringify(note.tags);
    if (!changed) return;
    setSave("saving");
    const id = setTimeout(async () => {
      await update.mutateAsync({ id: note._id, patch: { title, content, contentText: text, tags } });
      setSave("saved");
    }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, text, note]);

  if (!note) return null;

  const flag = (patch: Record<string, boolean>) => update.mutate({ id: note._id, patch });

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {save === "saving" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 text-success" /> Saved · edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {!note.trashed ? (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => flag({ pinned: !note.pinned })} title="Pin">
                <Pin className={cn("h-4 w-4", note.pinned && "fill-primary text-primary")} />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => flag({ favorite: !note.favorite })} title="Favorite">
                <Star className={cn("h-4 w-4", note.favorite && "fill-warning text-warning")} />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => flag({ archived: !note.archived })} title="Archive">
                <Archive className={cn("h-4 w-4", note.archived && "text-primary")} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" title="Move to folder">
                    <FolderInput className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => update.mutate({ id: note._id, patch: { folder: null } })}>No folder</DropdownMenuItem>
                  {folders.map((f) => (
                    <DropdownMenuItem key={f._id} onSelect={() => update.mutate({ id: note._id, patch: { folder: f._id } })}>
                      {f.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon-sm" onClick={() => flag({ trashed: true })} title="Move to trash">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => flag({ trashed: false })}>
                <RotateCcw className="h-4 w-4" /> Restore
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove.mutate(note._id)}>
                <Trash2 className="h-4 w-4" /> Delete forever
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            disabled={note.trashed}
            className="h-auto border-0 bg-transparent px-0 text-3xl font-bold shadow-none focus-visible:ring-0"
          />
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <TagInput value={tags} onChange={setTags} placeholder="Add tags…" />
            </div>
          </div>
        </div>

        <RichEditor noteId={note._id} content={content} editable={!note.trashed} onChange={(html, t) => { setContent(html); setText(t); }} />

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <div className="mx-6 mb-8 mt-4 rounded-xl border border-border bg-muted/30 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" /> Linked from {backlinks.length}
            </p>
            <div className="space-y-1">
              {backlinks.map((b) => (
                <button key={b._id} onClick={() => onSelectNote(b._id)} className="block text-sm text-primary hover:underline">
                  {b.title || "Untitled"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
