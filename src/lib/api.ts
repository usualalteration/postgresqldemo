import type { Task, TaskInput, TaskStats } from "./types";

const API_BASE = "/api/my";

/**
 * Fetch helper for OpenServerless actions. The generated wrapper nests the
 * module result under `body` on some deployments, so both response shapes
 * are normalized here before the caller sees the data.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new Error("Unable to reach the API. Check your connection.");
  }

  let raw: unknown = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  const data = unwrap(raw);

  const record = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  if (!response.ok || record.ok === false || record.error) {
    const message =
      (typeof record.error === "string" && record.error) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

function unwrap(raw: unknown): unknown {
  if (raw && typeof raw === "object" && "body" in raw) {
    const body = (raw as Record<string, unknown>).body;
    if (body && typeof body === "object") {
      return body;
    }
  }
  return raw;
}

export async function fetchTasks(params: {
  status?: string;
  q?: string;
}): Promise<Task[]> {
  const search = new URLSearchParams();
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  const qs = search.toString();

  const data = await request<{ ok: boolean; count: number; tasks: Task[] }>(
    `/v1/tasks${qs ? `?${qs}` : ""}`,
  );
  return Array.isArray(data.tasks) ? data.tasks : [];
}

export async function fetchStats(): Promise<TaskStats> {
  const data = await request<
    TaskStats & { ok: boolean; total: number; completed: number; pending: number }
  >("/v1/tasks-stats");
  return {
    total: data.total ?? 0,
    completed: data.completed ?? 0,
    pending: data.pending ?? 0,
    byStatus: data.byStatus ?? { "To Do": 0, "In Progress": 0, Done: 0 },
    byPriority: data.byPriority ?? { Low: 0, Medium: 0, High: 0 },
  };
}

export async function createTask(input: TaskInput): Promise<Task> {
  const data = await request<{ ok: boolean; task: Task }>("/v1/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.task;
}

export async function updateTask(
  id: number,
  input: Partial<TaskInput>,
): Promise<Task> {
  const data = await request<{ ok: boolean; task: Task }>(`/v1/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.task;
}

export async function deleteTask(id: number): Promise<void> {
  await request<{ ok: boolean }>(`/v1/tasks/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}