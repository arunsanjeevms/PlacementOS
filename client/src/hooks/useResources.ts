import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resourcesService } from "@/services/resources.service";
import { getApiErrorMessage } from "@/services/api";
import type { BulkAction, ResourceInput, ResourceListParams } from "@/types/resource";

export const resourceKeys = {
  all: ["resources"] as const,
  list: (p: ResourceListParams) => [...resourceKeys.all, "list", p] as const,
  summary: () => [...resourceKeys.all, "summary"] as const,
};

export function useResources(params: ResourceListParams = {}) {
  return useQuery({ queryKey: resourceKeys.list(params), queryFn: () => resourcesService.list(params) });
}

export function useResourceSummary() {
  return useQuery({ queryKey: resourceKeys.summary(), queryFn: () => resourcesService.summary() });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: resourceKeys.all });
}

export function useCreateResource() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: ResourceInput) => resourcesService.create(input),
    onSuccess: () => {
      invalidate();
      toast.success("Resource saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdateResource() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ResourceInput> }) => resourcesService.update(id, input),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeleteResource() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => resourcesService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Resource deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useBulkResources() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ ids, action, folder }: { ids: string[]; action: BulkAction; folder?: string }) =>
      resourcesService.bulk(ids, action, folder),
    onSuccess: () => {
      invalidate();
      toast.success("Updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useImportResources() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (resources: Partial<ResourceInput>[]) => resourcesService.importMany(resources),
    onSuccess: (count) => {
      invalidate();
      toast.success(`Imported ${count} resources`);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
