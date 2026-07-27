import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Star,
  Pin,
  Archive,
  Trash2,
  Folder as FolderIcon,
  FolderPlus,
  Files,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoteEditorPane } from "@/components/notes/NoteEditorPane";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFolderMutations, useFolders, useNoteMutations, useNotes } from "@/hooks/useNotes";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { NoteFilter } from "@/types/note";

const FILTERS: { value: NoteFilter; label: string; icon: typeof Files }[] = [
  { value: "all", label: "All Notes", icon: Files },
  { value: "favorite", label: "Favorites", icon: Star },
  { value: "pinned", label: "Pinned", icon: Pin },
  { value: "archived", label: "Archived", icon: Archive },
  { value: "trash", label: "Trash", icon: Trash2 },
];

export default function NotesPage() {
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowEditor, setMobileShowEditor] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: folders = [] } = useFolders();
  const folderMut = useFolderMutations();
  const { create } = useNoteMutations();

  const params = useMemo(
    () => ({ filter, folder: folderId ?? undefined, search: debouncedSearch || undefined }),
    [filter, folderId, debouncedSearch]
  );
  const { data: notes = [], isLoading } = useNotes(params);

  // Keep a valid selection.
  useEffect(() => {
    if (notes.length && !notes.find((n) => n._id === selectedId)) {
      setSelectedId(notes[0]?._id ?? null);
    }
    if (!notes.length) setSelectedId(null);
  }, [notes, selectedId]);

  const newNote = async () => {
    const note = await create.mutateAsync({ folder: folderId, title: "" });
    setFilter("all");
    setSelectedId(note._id);
    setMobileShowEditor(true);
  };

  const newFolder = () => {
    const name = window.prompt("Folder name");
    if (name?.trim()) folderMut.create.mutate({ name: name.trim() });
  };

  const selectNote = (id: string) => {
    setSelectedId(id);
    setMobileShowEditor(true);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-8rem)]">
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Rail: folders + filters */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-sidebar/50 lg:flex">
          <div className="flex items-center justify-between px-3 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Notes
            </span>
            <Button variant="ghost" size="icon-sm" onClick={newFolder} title="New folder">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setFolderId(null);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  filter === f.value && !folderId ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <f.icon className="h-4 w-4" /> {f.label}
              </button>
            ))}

            {folders.length > 0 && (
              <p className="px-2.5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Folders</p>
            )}
            {folders.map((folder) => (
              <div key={folder._id} className="group flex items-center">
                <button
                  onClick={() => {
                    setFilter("all");
                    setFolderId(folder._id);
                  }}
                  className={cn(
                    "flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    folderId === folder._id ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <FolderIcon className="h-4 w-4" /> <span className="truncate">{folder.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        const name = window.prompt("Rename folder", folder.name);
                        if (name?.trim()) folderMut.update.mutate({ id: folder._id, patch: { name: name.trim() } });
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onSelect={() => folderMut.remove.mutate(folder._id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </nav>
        </aside>

        {/* Note list */}
        <div className={cn("flex w-full flex-col border-r border-border lg:w-80 lg:shrink-0", mobileShowEditor && "hidden lg:flex")}>
          <div className="flex items-center gap-2 border-b border-border p-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" className="h-9 pl-8" />
            </div>
            <Button variant="gradient" size="icon" onClick={newNote} title="New note">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : notes.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={<FileText className="h-5 w-5" />} title="No notes here" description="Create a note to get started." className="py-10" />
              </div>
            ) : (
              notes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => selectNote(note._id)}
                  className={cn(
                    "mb-1 block w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                    selectedId === note._id ? "bg-primary/10" : "hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {note.pinned && <Pin className="h-3 w-3 shrink-0 fill-primary text-primary" />}
                    {note.favorite && <Star className="h-3 w-3 shrink-0 fill-warning text-warning" />}
                    <span className="truncate text-sm font-medium">{note.title || "Untitled"}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {note.contentText?.slice(0, 80) || "No content"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className={cn("flex-1", !mobileShowEditor && "hidden lg:block")}>
          {selectedId ? (
            <div className="flex h-full flex-col">
              <button className="flex items-center gap-1 px-4 pt-3 text-sm text-muted-foreground lg:hidden" onClick={() => setMobileShowEditor(false)}>
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex-1 overflow-hidden">
                <NoteEditorPane noteId={selectedId} onSelectNote={selectNote} />
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-6">
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="Select or create a note"
                description="Your notes support markdown, checklists, code, tables and [[backlinks]]."
                action={
                  <Button variant="gradient" onClick={newNote}>
                    <Plus className="h-4 w-4" /> New note
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
