import { api, type ApiEnvelope } from "./api";
import type { Achievement, DashboardData, DayDetail, HeatmapDay, Readiness, Statistics } from "@/types/analytics";

export const analyticsService = {
  async dashboard(): Promise<DashboardData> {
    const { data } = await api.get<ApiEnvelope<DashboardData>>("/analytics/dashboard");
    return data.data;
  },
  async heatmap(days = 365): Promise<HeatmapDay[]> {
    const { data } = await api.get<ApiEnvelope<HeatmapDay[]>>("/analytics/heatmap", { params: { days } });
    return data.data;
  },
  async dayDetail(date: string): Promise<DayDetail> {
    const { data } = await api.get<ApiEnvelope<DayDetail>>("/analytics/heatmap/day", { params: { date } });
    return data.data;
  },
  async statistics(days = 30): Promise<Statistics> {
    const { data } = await api.get<ApiEnvelope<Statistics>>("/analytics/statistics", { params: { days } });
    return data.data;
  },
  async readiness(): Promise<Readiness> {
    const { data } = await api.get<ApiEnvelope<Readiness>>("/analytics/readiness");
    return data.data;
  },
  async achievements(): Promise<Achievement[]> {
    const { data } = await api.get<ApiEnvelope<Achievement[]>>("/analytics/achievements");
    return data.data;
  },
};
