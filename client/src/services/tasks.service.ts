import { api, type ApiEnvelope } from "./api";
import type { Task, TaskInput, TaskSummary } from "@/types/task";
import type { TaskStatus } from "@/constants/tasks";

export interface TaskListParams {
  status?: string;
  scope?: string;
  category?: string;
  priority?: string;
  tag?: string;
  search?: string;
  pinned?: boolean;
  from?: string;
  to?: string;
  dueFrom?: string;
  dueTo?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  page?: number;
}

export interface ReorderItem {
  id: string;
  order: number;
  status?: TaskStatus;
}

export const tasksService = {
  async list(params: TaskListParams = {}): Promise<Task[]> {
    const { data } = await api.get<ApiEnvelope<Task[]>>("/tasks", { params });
    return data.data;
  },

  async summary(): Promise<TaskSummary> {
    const { data } = await api.get<ApiEnvelope<TaskSummary>>("/tasks/summary");
    return data.data;
  },

  async create(input: TaskInput): Promise<Task> {
    const { data } = await api.post<ApiEnvelope<Task>>("/tasks", input);
    return data.data;
  },

  async update(id: string, input: Partial<TaskInput>): Promise<Task> {
    const { data } = await api.patch<ApiEnvelope<Task>>(`/tasks/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async toggle(id: string): Promise<{ task: Task; next: Task | null }> {
    const { data } = await api.patch<ApiEnvelope<{ task: Task; next: Task | null }>>(`/tasks/${id}/toggle`);
    return data.data;
  },

  async reorder(items: ReorderItem[]): Promise<void> {
    await api.patch("/tasks/reorder", { items });
  },

  async addSubtask(id: string, title: string): Promise<Task> {
    const { data } = await api.post<ApiEnvelope<Task>>(`/tasks/${id}/subtasks`, { title });
    return data.data;
  },

  async toggleSubtask(id: string, subId: string): Promise<Task> {
    const { data } = await api.patch<ApiEnvelope<Task>>(`/tasks/${id}/subtasks/${subId}/toggle`);
    return data.data;
  },

  async deleteSubtask(id: string, subId: string): Promise<Task> {
    const { data } = await api.delete<ApiEnvelope<Task>>(`/tasks/${id}/subtasks/${subId}`);
    return data.data;
  },
};
