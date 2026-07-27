import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { journalService } from "@/services/journal.service";
import { getApiErrorMessage } from "@/services/api";
import type { JournalInput, JournalType } from "@/types/journal";

export const journalKeys = {
  all: ["journal"] as const,
  list: (p: { type?: JournalType; outcome?: string; search?: string }) => [...journalKeys.all, "list", p] as const,
};

export function useJournal(params: { type?: JournalType; outcome?: string; search?: string } = {}) {
  return useQuery({ queryKey: journalKeys.list(params), queryFn: () => journalService.list(params) });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: journalKeys.all });
}

export function useCreateJournal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: JournalInput) => journalService.create(input),
    onSuccess: () => {
      invalidate();
      toast.success("Entry saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
export function useUpdateJournal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<JournalInput> }) => journalService.update(id, input),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
export function useDeleteJournal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => journalService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Entry deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
