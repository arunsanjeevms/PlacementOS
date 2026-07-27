import type { ResourceType } from "@/constants/resources";

export type Difficulty = "easy" | "medium" | "hard";

export interface Resource {
  _id: string;
  user: string;
  title: string;
  url: string;
  description?: string;
  type: ResourceType;
  category?: string;
  subject?: string;
  difficulty?: Difficulty;
  tags: string[];
  notes?: string;
  folder?: string;
  previewImage?: string;
  rating: number;
  pinned: boolean;
  favorite: boolean;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceInput {
  title: string;
  url: string;
  description?: string;
  type?: ResourceType;
  category?: string;
  subject?: string;
  difficulty?: Difficulty;
  tags?: string[];
  notes?: string;
  folder?: string;
  rating?: number;
  favorite?: boolean;
  pinned?: boolean;
  completed?: boolean;
}

export interface ResourceListParams {
  type?: string;
  category?: string;
  difficulty?: string;
  tag?: string;
  folder?: string;
  favorite?: boolean;
  pinned?: boolean;
  completed?: boolean;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
}

export interface ResourceSummary {
  byType: Record<string, number>;
  total: number;
  completed: number;
  favorites: number;
  folders: string[];
}

export type BulkAction = "delete" | "favorite" | "unfavorite" | "complete" | "uncomplete" | "pin" | "unpin" | "move";
