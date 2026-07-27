import { api, type ApiEnvelope } from "./api";
import type { Company, CompanyInput, CompanySummary, Round } from "@/types/company";

export const companiesService = {
  async list(params: { status?: string; search?: string } = {}): Promise<Company[]> {
    const { data } = await api.get<ApiEnvelope<Company[]>>("/companies", { params });
    return data.data;
  },
  async summary(): Promise<CompanySummary> {
    const { data } = await api.get<ApiEnvelope<CompanySummary>>("/companies/summary");
    return data.data;
  },
  async create(input: CompanyInput): Promise<Company> {
    const { data } = await api.post<ApiEnvelope<Company>>("/companies", input);
    return data.data;
  },
  async update(id: string, input: Partial<CompanyInput>): Promise<Company> {
    const { data } = await api.patch<ApiEnvelope<Company>>(`/companies/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/companies/${id}`);
  },
  async addRound(id: string, round: Partial<Round>): Promise<Company> {
    const { data } = await api.post<ApiEnvelope<Company>>(`/companies/${id}/rounds`, round);
    return data.data;
  },
  async updateRound(id: string, roundId: string, patch: Partial<Round>): Promise<Company> {
    const { data } = await api.patch<ApiEnvelope<Company>>(`/companies/${id}/rounds/${roundId}`, patch);
    return data.data;
  },
  async deleteRound(id: string, roundId: string): Promise<Company> {
    const { data } = await api.delete<ApiEnvelope<Company>>(`/companies/${id}/rounds/${roundId}`);
    return data.data;
  },
};
