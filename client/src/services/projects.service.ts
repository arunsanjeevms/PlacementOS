import { api, type ApiEnvelope } from "./api";
import type { Project, ProjectInput, ProjectStatus } from "@/types/project";

export interface ProjectReorderItem {
  id: string;
  order: number;
  status?: ProjectStatus;
}

export const projectsService = {
  async list(): Promise<Project[]> {
    const { data } = await api.get<ApiEnvelope<Project[]>>("/projects");
    return data.data;
  },
  async create(input: ProjectInput): Promise<Project> {
    const { data } = await api.post<ApiEnvelope<Project>>("/projects", input);
    return data.data;
  },
  async update(id: string, input: Partial<ProjectInput>): Promise<Project> {
    const { data } = await api.patch<ApiEnvelope<Project>>(`/projects/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
  async reorder(items: ProjectReorderItem[]): Promise<void> {
    await api.patch("/projects/reorder", { items });
  },
  async addItem(id: string, field: "milestones" | "tasks", title: string, dueDate?: string): Promise<Project> {
    const { data } = await api.post<ApiEnvelope<Project>>(`/projects/${id}/${field}`, { title, dueDate });
    return data.data;
  },
  async toggleItem(id: string, field: "milestones" | "tasks", itemId: string): Promise<Project> {
    const { data } = await api.patch<ApiEnvelope<Project>>(`/projects/${id}/${field}/${itemId}/toggle`);
    return data.data;
  },
  async removeItem(id: string, field: "milestones" | "tasks", itemId: string): Promise<Project> {
    const { data } = await api.delete<ApiEnvelope<Project>>(`/projects/${id}/${field}/${itemId}`);
    return data.data;
  },
};
