import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksService, type ReorderItem, type TaskListParams } from "@/services/tasks.service";
import { getApiErrorMessage } from "@/services/api";
import type { Task, TaskInput } from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  summary: () => [...taskKeys.all, "summary"] as const,
};

export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksService.list(params),
  });
}

export function useTaskSummary() {
  return useQuery({ queryKey: taskKeys.summary(), queryFn: () => tasksService.summary() });
}

/** Invalidate every task query (lists + summary) after a change. */
function useInvalidateTasks() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: taskKeys.all });
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (input: TaskInput) => tasksService.create(input),
    onSuccess: () => {
      invalidate();
      toast.success("Task created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaskInput> }) => tasksService.update(id, input),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (id: string) => tasksService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Task deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.toggle(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() });
      const snapshots = qc.getQueriesData<Task[]>({ queryKey: taskKeys.lists() });
      snapshots.forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData<Task[]>(
          key,
          data.map((t) =>
            t._id === id
              ? { ...t, status: t.status === "done" ? "todo" : "done", completedAt: t.status === "done" ? undefined : new Date().toISOString() }
              : t
          )
        );
      });
      return { snapshots };
    },
    onError: (e, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(getApiErrorMessage(e));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderItem[]) => tasksService.reorder(items),
    onError: (e) => {
      toast.error(getApiErrorMessage(e));
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.summary() }),
  });
}

export function useSubtaskMutations() {
  const invalidate = useInvalidateTasks();
  const add = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => tasksService.addSubtask(id, title),
    onSuccess: invalidate,
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const toggle = useMutation({
    mutationFn: ({ id, subId }: { id: string; subId: string }) => tasksService.toggleSubtask(id, subId),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ id, subId }: { id: string; subId: string }) => tasksService.deleteSubtask(id, subId),
    onSuccess: invalidate,
  });
  return { add, toggle, remove };
}
