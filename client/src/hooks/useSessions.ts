import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sessionsService, type SessionListParams } from "@/services/sessions.service";
import { getApiErrorMessage } from "@/services/api";
import type { SessionInput } from "@/types/session";

export const sessionKeys = {
  all: ["sessions"] as const,
  list: (p: SessionListParams) => [...sessionKeys.all, "list", p] as const,
  summary: () => [...sessionKeys.all, "summary"] as const,
};

export function useSessions(params: SessionListParams = {}) {
  return useQuery({ queryKey: sessionKeys.list(params), queryFn: () => sessionsService.list(params) });
}

export function useSessionSummary() {
  return useQuery({ queryKey: sessionKeys.summary(), queryFn: () => sessionsService.summary() });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SessionInput) => sessionsService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["heatmap"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SessionInput> }) => sessionsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all });
      toast.success("Session removed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
