import { api, type ApiEnvelope } from "./api";
import type { Topic, TopicPatch, TrackerKind, TrackerSummary } from "@/types/topic";

export const topicsService = {
  async list(kind: TrackerKind): Promise<Topic[]> {
    const { data } = await api.get<ApiEnvelope<Topic[]>>("/topics", { params: { kind } });
    return data.data;
  },
  async summary(kind: TrackerKind): Promise<TrackerSummary> {
    const { data } = await api.get<ApiEnvelope<TrackerSummary>>("/topics/summary", { params: { kind } });
    return data.data;
  },
  async create(kind: TrackerKind, name: string): Promise<Topic> {
    const { data } = await api.post<ApiEnvelope<Topic>>("/topics", { kind, name });
    return data.data;
  },
  async update(id: string, patch: TopicPatch): Promise<Topic> {
    const { data } = await api.patch<ApiEnvelope<Topic>>(`/topics/${id}`, patch);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/topics/${id}`);
  },
};
