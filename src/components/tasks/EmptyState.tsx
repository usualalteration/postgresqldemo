import { Inbox, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  filtered: boolean;
  onAddTask: () => void;
  onClearFilters: () => void;
}

export function EmptyState({ filtered, onAddTask, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
        {filtered ? (
          <SearchX className="h-7 w-7 text-indigo-500" />
        ) : (
          <Inbox className="h-7 w-7 text-indigo-500" />
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
        {filtered ? "No matching tasks" : "No tasks yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {filtered
          ? "Nothing matches your current search or filter. Try a different title keyword or switch the status filter."
          : "Your task board is empty. Create your first task and it will be stored in PostgreSQL."}
      </p>
      <div className="mt-5">
        {filtered ? (
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="border-slate-300"
          >
            Clear filters
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onAddTask}
            className="bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-700"
          >
            Add your first task
          </Button>
        )}
      </div>
    </div>
  );
}