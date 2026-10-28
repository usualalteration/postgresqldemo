export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export const TASK_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];
export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];