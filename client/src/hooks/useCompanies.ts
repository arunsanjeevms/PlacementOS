import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companiesService } from "@/services/companies.service";
import { getApiErrorMessage } from "@/services/api";
import type { CompanyInput, Round } from "@/types/company";

export const companyKeys = {
  all: ["companies"] as const,
  list: (p: { status?: string; search?: string }) => [...companyKeys.all, "list", p] as const,
  summary: () => [...companyKeys.all, "summary"] as const,
};

export function useCompanies(params: { status?: string; search?: string } = {}) {
  return useQuery({ queryKey: companyKeys.list(params), queryFn: () => companiesService.list(params) });
}
export function useCompanySummary() {
  return useQuery({ queryKey: companyKeys.summary(), queryFn: () => companiesService.summary() });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: companyKeys.all });
}

export function useCreateCompany() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CompanyInput) => companiesService.create(input),
    onSuccess: () => {
      invalidate();
      toast.success("Company added");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
export function useUpdateCompany() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CompanyInput> }) => companiesService.update(id, input),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
export function useDeleteCompany() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => companiesService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Company removed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
export function useRoundMutations() {
  const invalidate = useInvalidate();
  const add = useMutation({
    mutationFn: ({ id, round }: { id: string; round: Partial<Round> }) => companiesService.addRound(id, round),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const update = useMutation({
    mutationFn: ({ id, roundId, patch }: { id: string; roundId: string; patch: Partial<Round> }) => companiesService.updateRound(id, roundId, patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ id, roundId }: { id: string; roundId: string }) => companiesService.deleteRound(id, roundId),
    onSuccess: invalidate,
  });
  return { add, update, remove };
}
