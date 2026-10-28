import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, CheckCheck, Plus, RefreshCw, Search } from "lucide-react";

import { EmptyState } from "@/components/tasks/EmptyState";
import { Sidebar } from "@/components/tasks/Sidebar";
import { StatsCards } from "@/components/tasks/StatsCards";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskListSkeleton } from "@/components/tasks/TaskListSkeleton";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateTask,
  useDeleteTask,
  useStats,
  useTasks,
  useUpdateTask,
} from "@/hooks/use-tasks";
import type { Task, TaskInput } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["All", "To Do", "In Progress", "Done"];

const Index = () => {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Debounce the search box so typing does not fire a query per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const tasksQuery = useTasks(statusFilter, search);
  const statsQuery = useStats();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const saving = createMutation.isPending || updateMutation.isPending;
  const tasks = tasksQuery.data ?? [];
  const isFiltered = statusFilter !== "All" || search !== "";

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (input: TaskInput) => {
    if (editingTask) {
      updateMutation.mutate(
        { id: editingTask.id, input },
        { onSuccess: closeModal },
      );
    } else {
      createMutation.mutate(input, { onSuccess: closeModal });
    }
  };

  const handleConfirmDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSettled: () => setConfirmDeleteId(null),
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setStatusFilter("All");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        total={statsQuery.data?.total ?? 0}
        byStatus={statsQuery.data?.byStatus ?? {}}
      />

      <main className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm shadow-indigo-500/25 lg:hidden">
                <CheckCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Task Dashboard
                </h1>
                <p className="text-xs text-slate-500">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={openCreateModal}
              className="bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <StatsCards stats={statsQuery.data} isLoading={statsQuery.isLoading} />

          {/* Toolbar: search + status filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <label htmlFor="task-search" className="sr-only">
                Search tasks by title
              </label>
              <Input
                id="task-search"
                name="search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search tasks by title…"
                className="pl-9"
              />
            </div>

            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter tasks by status"
            >
              {STATUS_FILTERS.map((status) => {
                const active = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600",
                    )}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {tasksQuery.isLoading ? (
            <TaskListSkeleton />
          ) : tasksQuery.isError ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
                <AlertTriangle className="h-7 w-7 text-rose-500" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
                Could not load tasks
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {tasksQuery.error instanceof Error
                  ? tasksQuery.error.message
                  : "An unexpected error occurred while contacting the API."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 border-slate-300"
                onClick={() => tasksQuery.refetch()}
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              filtered={isFiltered}
              onAddTask={openCreateModal}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Showing {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                {isFiltered ? " for the current search and filters" : ""}.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditModal}
                    onDelete={(id) => setConfirmDeleteId(id)}
                    onConfirmDelete={handleConfirmDelete}
                    confirmingDelete={confirmDeleteId === task.id}
                    onCancelConfirm={() => setConfirmDeleteId(null)}
                    deletePending={
                      deleteMutation.isPending && confirmDeleteId === task.id
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Index;