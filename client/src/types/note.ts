export interface Folder {
  _id: string;
  user: string;
  name: string;
  parent?: string | null;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  contentText: string;
  folder?: string | null;
  tags: string[];
  category?: string;
  relatedProject?: string | null;
  relatedTask?: string | null;
  relatedCompany?: string | null;
  links: string[];
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  trashed: boolean;
  trashedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteFilter = "all" | "favorite" | "pinned" | "archived" | "trash";

export interface NoteListParams {
  folder?: string;
  tag?: string;
  filter?: NoteFilter;
  search?: string;
}

export interface Backlink {
  _id: string;
  title: string;
  updatedAt: string;
}

export interface NotePatch {
  title?: string;
  content?: string;
  contentText?: string;
  folder?: string | null;
  tags?: string[];
  category?: string;
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
  trashed?: boolean;
}
