import { CheckCircle2, Clock, ListChecks } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TaskStats } from "@/lib/types";

interface StatsCardsProps {
  stats: TaskStats | undefined;
  isLoading: boolean;
}

const CARDS = [
  {
    key: "total",
    label: "Total Tasks",
    hint: "All tasks in PostgreSQL",
    icon: ListChecks,
    chip: "bg-indigo-50 text-indigo-600",
    accent: "from-indigo-500/70",
    value: (s: TaskStats) => s.total,
  },
  {
    key: "completed",
    label: "Completed",
    hint: "Tasks marked as Done",
    icon: CheckCircle2,
    chip: "bg-emerald-50 text-emerald-600",
    accent: "from-emerald-500/70",
    value: (s: TaskStats) => s.completed,
  },
  {
    key: "pending",
    label: "Pending",
    hint: "Still to be finished",
    icon: Clock,
    chip: "bg-amber-50 text-amber-600",
    accent: "from-amber-500/70",
    value: (s: TaskStats) => s.pending,
  },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map(({ key, label, hint, icon: Icon, chip, accent, value }) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent opacity-0 transition-opacity group-hover:opacity-100",
              accent,
            )}
          />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              {isLoading ? (
                <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-slate-100" />
              ) : (
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {stats ? value(stats) : 0}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">{hint}</p>
            </div>
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg",
                chip,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}