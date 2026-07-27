import { api, type ApiEnvelope } from "./api";
import type { Backlink, Folder, Note, NoteListParams, NotePatch } from "@/types/note";

export const notesService = {
  // Folders
  async listFolders(): Promise<Folder[]> {
    const { data } = await api.get<ApiEnvelope<Folder[]>>("/notes/folders");
    return data.data;
  },
  async createFolder(name: string, parent?: string | null): Promise<Folder> {
    const { data } = await api.post<ApiEnvelope<Folder>>("/notes/folders", { name, parent });
    return data.data;
  },
  async updateFolder(id: string, patch: Partial<Folder>): Promise<Folder> {
    const { data } = await api.patch<ApiEnvelope<Folder>>(`/notes/folders/${id}`, patch);
    return data.data;
  },
  async deleteFolder(id: string): Promise<void> {
    await api.delete(`/notes/folders/${id}`);
  },

  // Notes
  async list(params: NoteListParams = {}): Promise<Note[]> {
    const { data } = await api.get<ApiEnvelope<Note[]>>("/notes", { params });
    return data.data;
  },
  async get(id: string): Promise<Note> {
    const { data } = await api.get<ApiEnvelope<Note>>(`/notes/${id}`);
    return data.data;
  },
  async create(input: NotePatch = {}): Promise<Note> {
    const { data } = await api.post<ApiEnvelope<Note>>("/notes", input);
    return data.data;
  },
  async update(id: string, patch: NotePatch): Promise<Note> {
    const { data } = await api.patch<ApiEnvelope<Note>>(`/notes/${id}`, patch);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },
  async emptyTrash(): Promise<void> {
    await api.delete("/notes/trash/empty");
  },
  async backlinks(id: string): Promise<Backlink[]> {
    const { data } = await api.get<ApiEnvelope<Backlink[]>>(`/notes/${id}/backlinks`);
    return data.data;
  },
};
