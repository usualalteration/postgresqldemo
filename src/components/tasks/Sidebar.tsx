import {
  CheckCheck,
  CheckCircle2,
  Circle,
  Database,
  LayoutDashboard,
  Timer,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  total: number;
  byStatus: Record<string, number>;
}

const NAV_ITEMS = [
  { key: "All", label: "Dashboard", icon: LayoutDashboard },
  { key: "To Do", label: "To Do", icon: Circle },
  { key: "In Progress", label: "In Progress", icon: Timer },
  { key: "Done", label: "Done", icon: CheckCircle2 },
];

export function Sidebar({ activeStatus, onStatusChange, total, byStatus }: SidebarProps) {
  const countFor = (key: string) =>
    key === "All" ? total : (byStatus?.[key] ?? 0);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25">
          <CheckCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold tracking-tight text-slate-900">
            TaskFlow
          </p>
          <p className="text-xs text-slate-500">PostgreSQL Task Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Task views">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = activeStatus === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onStatusChange(key)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-indigo-50 font-medium text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-indigo-600" : "text-slate-400",
                  )}
                />
                {label}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {countFor(key)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Database className="h-3.5 w-3.5" />
            Stack
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            React → OpenServerless → PostgreSQL
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live data from PostgreSQL
          </p>
        </div>
      </div>
    </aside>
  );
}