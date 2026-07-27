import { api, type ApiEnvelope } from "./api";
import type { SessionInput, SessionSummary, StudySession } from "@/types/session";

export interface SessionListParams {
  from?: string;
  to?: string;
  category?: string;
  limit?: number;
  page?: number;
}

export const sessionsService = {
  async list(params: SessionListParams = {}): Promise<StudySession[]> {
    const { data } = await api.get<ApiEnvelope<StudySession[]>>("/sessions", { params });
    return data.data;
  },
  async summary(): Promise<SessionSummary> {
    const { data } = await api.get<ApiEnvelope<SessionSummary>>("/sessions/summary");
    return data.data;
  },
  async create(input: SessionInput): Promise<StudySession> {
    const { data } = await api.post<ApiEnvelope<StudySession>>("/sessions", input);
    return data.data;
  },
  async update(id: string, input: Partial<SessionInput>): Promise<StudySession> {
    const { data } = await api.patch<ApiEnvelope<StudySession>>(`/sessions/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`);
  },
};
