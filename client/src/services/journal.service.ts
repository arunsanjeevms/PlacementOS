import { api, type ApiEnvelope } from "./api";
import type { JournalEntry, JournalInput, JournalType } from "@/types/journal";

export const journalService = {
  async list(params: { type?: JournalType; outcome?: string; search?: string } = {}): Promise<JournalEntry[]> {
    const { data } = await api.get<ApiEnvelope<JournalEntry[]>>("/journal", { params });
    return data.data;
  },
  async create(input: JournalInput): Promise<JournalEntry> {
    const { data } = await api.post<ApiEnvelope<JournalEntry>>("/journal", input);
    return data.data;
  },
  async update(id: string, input: Partial<JournalInput>): Promise<JournalEntry> {
    const { data } = await api.patch<ApiEnvelope<JournalEntry>>(`/journal/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/journal/${id}`);
  },
};
