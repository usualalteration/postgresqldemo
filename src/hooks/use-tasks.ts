import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { createTask, deleteTask, fetchStats, fetchTasks, updateTask } from "@/lib/api";
import type { TaskInput } from "@/lib/types";

export function useTasks(status: string, search: string) {
  return useQuery({
    queryKey: ["tasks", status, search],
    queryFn: () => fetchTasks({ status, q: search }),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    onSuccess: (task) => {
      invalidate();
      toast.success("Task created", { description: `“${task.title}” was added to PostgreSQL.` });
    },
    onError: (error: Error) => {
      toast.error("Could not create the task", { description: error.message });
    },
  });
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<TaskInput> }) =>
      updateTask(id, input),
    onSuccess: (task) => {
      invalidate();
      toast.success("Task updated", { description: `“${task.title}” was saved.` });
    },
    onError: (error: Error) => {
      toast.error("Could not update the task", { description: error.message });
    },
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      invalidate();
      toast.success("Task deleted", {
        description: "The task was removed from PostgreSQL.",
      });
    },
    onError: (error: Error) => {
      toast.error("Could not delete the task", { description: error.message });
    },
  });
}