import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { topicsService } from "@/services/topics.service";
import { getApiErrorMessage } from "@/services/api";
import type { Topic, TopicPatch, TrackerKind } from "@/types/topic";

export const topicKeys = {
  all: ["topics"] as const,
  list: (kind: TrackerKind) => [...topicKeys.all, "list", kind] as const,
  summary: (kind: TrackerKind) => [...topicKeys.all, "summary", kind] as const,
};

export function useTopics(kind: TrackerKind) {
  return useQuery({ queryKey: topicKeys.list(kind), queryFn: () => topicsService.list(kind) });
}

export function useTrackerSummary(kind: TrackerKind) {
  return useQuery({ queryKey: topicKeys.summary(kind), queryFn: () => topicsService.summary(kind) });
}

export function useCreateTopic(kind: TrackerKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => topicsService.create(kind, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: topicKeys.list(kind) });
      qc.invalidateQueries({ queryKey: topicKeys.summary(kind) });
      toast.success("Topic added");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/** Optimistic update so sliders/steppers feel instant. */
export function useUpdateTopic(kind: TrackerKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TopicPatch }) => topicsService.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: topicKeys.list(kind) });
      const prev = qc.getQueryData<Topic[]>(topicKeys.list(kind));
      if (prev) {
        qc.setQueryData<Topic[]>(
          topicKeys.list(kind),
          prev.map((t) => (t._id === id ? { ...t, ...patch } : t))
        );
      }
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(topicKeys.list(kind), ctx.prev);
      toast.error(getApiErrorMessage(e));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: topicKeys.list(kind) });
      qc.invalidateQueries({ queryKey: topicKeys.summary(kind) });
    },
  });
}

export function useDeleteTopic(kind: TrackerKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => topicsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: topicKeys.list(kind) });
      qc.invalidateQueries({ queryKey: topicKeys.summary(kind) });
      toast.success("Topic removed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
