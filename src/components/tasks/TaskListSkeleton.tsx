export function TaskListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded-md bg-slate-100" />
          <div className="mt-2 h-3 w-full animate-pulse rounded-md bg-slate-100" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded-md bg-slate-100" />
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="h-3 w-24 animate-pulse rounded-md bg-slate-100" />
            <div className="h-3 w-12 animate-pulse rounded-md bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}