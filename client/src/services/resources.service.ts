import { api, type ApiEnvelope } from "./api";
import type { BulkAction, Resource, ResourceInput, ResourceListParams, ResourceSummary } from "@/types/resource";

export const resourcesService = {
  async list(params: ResourceListParams = {}): Promise<Resource[]> {
    const { data } = await api.get<ApiEnvelope<Resource[]>>("/resources", { params });
    return data.data;
  },
  async summary(): Promise<ResourceSummary> {
    const { data } = await api.get<ApiEnvelope<ResourceSummary>>("/resources/summary");
    return data.data;
  },
  async create(input: ResourceInput): Promise<Resource> {
    const { data } = await api.post<ApiEnvelope<Resource>>("/resources", input);
    return data.data;
  },
  async update(id: string, input: Partial<ResourceInput>): Promise<Resource> {
    const { data } = await api.patch<ApiEnvelope<Resource>>(`/resources/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/resources/${id}`);
  },
  async bulk(ids: string[], action: BulkAction, folder?: string): Promise<void> {
    await api.post("/resources/bulk", { ids, action, folder });
  },
  async importMany(resources: Partial<ResourceInput>[]): Promise<number> {
    const { data } = await api.post<ApiEnvelope<{ imported: number }>>("/resources/import", { resources });
    return data.data.imported;
  },
  async exportAll(): Promise<Resource[]> {
    const { data } = await api.get<ApiEnvelope<Resource[]>>("/resources/export");
    return data.data;
  },
};
