import { format } from "date-fns";
import { CheckCircle2, Pencil, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  deletePending: boolean;
  confirmingDelete: boolean;
  onCancelConfirm: () => void;
  onConfirmDelete: (id: number) => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-sky-200 bg-sky-50 text-sky-700",
};

const STATUS_STYLES: Record<string, string> = {
  "To Do": "border-slate-200 bg-slate-50 text-slate-600",
  "In Progress": "border-violet-200 bg-violet-50 text-violet-700",
  Done: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const STATUS_DOTS: Record<string, string> = {
  "To Do": "bg-slate-400",
  "In Progress": "bg-violet-500",
  Done: "bg-emerald-500",
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  deletePending,
  confirmingDelete,
  onCancelConfirm,
  onConfirmDelete,
}: TaskCardProps) {
  const created = task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy") : "";

  return (
    <article className="group flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
            STATUS_STYLES[task.status] ?? STATUS_STYLES["To Do"],
          )}
        >
          <span
            className={cn(
              "mr-1.5 h-1.5 w-1.5 rounded-full",
              STATUS_DOTS[task.status] ?? STATUS_DOTS["To Do"],
            )}
          />
          {task.status}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
            PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium,
          )}
        >
          {task.priority} priority
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900">
        {task.title}
      </h3>
      {task.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {task.description}
        </p>
      ) : (
        <p className="mt-1.5 line-clamp-2 text-sm italic text-slate-400">
          No description
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Created {created}
        </span>

        {confirmingDelete ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={deletePending}
              onClick={() => onConfirmDelete(task.id)}
              className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
            >
              {deletePending ? "Deleting…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={onCancelConfirm}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cancel delete"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              aria-label={`Edit ${task.title}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}