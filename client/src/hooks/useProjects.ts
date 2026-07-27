import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsService, type ProjectReorderItem } from "@/services/projects.service";
import { getApiErrorMessage } from "@/services/api";
import type { ProjectInput } from "@/types/project";

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
};

export function useProjects() {
  return useQuery({ queryKey: projectKeys.list(), queryFn: () => projectsService.list() });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: projectKeys.all });
}

export function useCreateProject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: ProjectInput) => projectsService.create(input),
    onSuccess: () => {
      invalidate();
      toast.success("Project created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdateProject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProjectInput> }) => projectsService.update(id, input),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Project deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useReorderProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: ProjectReorderItem[]) => projectsService.reorder(items),
    onError: (e) => {
      toast.error(getApiErrorMessage(e));
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useProjectChecklist() {
  const invalidate = useInvalidate();
  const add = useMutation({
    mutationFn: ({ id, field, title, dueDate }: { id: string; field: "milestones" | "tasks"; title: string; dueDate?: string }) =>
      projectsService.addItem(id, field, title, dueDate),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const toggle = useMutation({
    mutationFn: ({ id, field, itemId }: { id: string; field: "milestones" | "tasks"; itemId: string }) =>
      projectsService.toggleItem(id, field, itemId),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ id, field, itemId }: { id: string; field: "milestones" | "tasks"; itemId: string }) =>
      projectsService.removeItem(id, field, itemId),
    onSuccess: invalidate,
  });
  return { add, toggle, remove };
}
