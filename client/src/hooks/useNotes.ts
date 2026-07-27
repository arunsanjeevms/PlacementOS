import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notesService } from "@/services/notes.service";
import { getApiErrorMessage } from "@/services/api";
import type { NoteListParams, NotePatch } from "@/types/note";

export const noteKeys = {
  all: ["notes"] as const,
  list: (p: NoteListParams) => [...noteKeys.all, "list", p] as const,
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
  backlinks: (id: string) => [...noteKeys.all, "backlinks", id] as const,
  folders: ["folders"] as const,
};

export function useFolders() {
  return useQuery({ queryKey: noteKeys.folders, queryFn: () => notesService.listFolders() });
}

export function useNotes(params: NoteListParams) {
  return useQuery({ queryKey: noteKeys.list(params), queryFn: () => notesService.list(params) });
}

export function useNote(id: string | null) {
  return useQuery({ queryKey: noteKeys.detail(id ?? ""), queryFn: () => notesService.get(id!), enabled: !!id });
}

export function useBacklinks(id: string | null) {
  return useQuery({ queryKey: noteKeys.backlinks(id ?? ""), queryFn: () => notesService.backlinks(id!), enabled: !!id });
}

export function useFolderMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: noteKeys.folders });
  const create = useMutation({
    mutationFn: ({ name, parent }: { name: string; parent?: string | null }) => notesService.createFolder(name, parent),
    onSuccess: () => {
      invalidate();
      toast.success("Folder created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) => notesService.updateFolder(id, patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => notesService.deleteFolder(id),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: noteKeys.all });
      toast.success("Folder deleted");
    },
  });
  return { create, update, remove };
}

export function useNoteMutations() {
  const qc = useQueryClient();
  const invalidateLists = () => qc.invalidateQueries({ queryKey: [...noteKeys.all, "list"] });

  const create = useMutation({
    mutationFn: (input: NotePatch) => notesService.create(input),
    onSuccess: () => invalidateLists(),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: NotePatch }) => notesService.update(id, patch),
    onSuccess: (note) => {
      invalidateLists();
      qc.setQueryData(noteKeys.detail(note._id), note);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => notesService.remove(id),
    onSuccess: () => {
      invalidateLists();
      toast.success("Note deleted");
    },
  });
  const emptyTrash = useMutation({
    mutationFn: () => notesService.emptyTrash(),
    onSuccess: () => {
      invalidateLists();
      toast.success("Trash emptied");
    },
  });
  return { create, update, remove, emptyTrash };
}
