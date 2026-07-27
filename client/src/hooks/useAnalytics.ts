import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";

export const analyticsKeys = {
  dashboard: ["analytics", "dashboard"] as const,
  heatmap: (days: number) => ["heatmap", days] as const,
  day: (date: string) => ["heatmap", "day", date] as const,
  stats: (days: number) => ["stats", days] as const,
  readiness: ["analytics", "readiness"] as const,
  achievements: ["analytics", "achievements"] as const,
};

export function useDashboard() {
  return useQuery({ queryKey: analyticsKeys.dashboard, queryFn: () => analyticsService.dashboard() });
}
export function useHeatmap(days = 365) {
  return useQuery({ queryKey: analyticsKeys.heatmap(days), queryFn: () => analyticsService.heatmap(days) });
}
export function useDayDetail(date: string | null) {
  return useQuery({ queryKey: analyticsKeys.day(date ?? ""), queryFn: () => analyticsService.dayDetail(date!), enabled: !!date });
}
export function useStatistics(days = 30) {
  return useQuery({ queryKey: analyticsKeys.stats(days), queryFn: () => analyticsService.statistics(days) });
}
export function useReadiness() {
  return useQuery({ queryKey: analyticsKeys.readiness, queryFn: () => analyticsService.readiness() });
}
export function useAchievements() {
  return useQuery({ queryKey: analyticsKeys.achievements, queryFn: () => analyticsService.achievements() });
}
