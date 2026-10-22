import { Skeleton } from "@/components/ui/skeleton";

// Match the final grid dimensions so streamed analytics do not shift the surrounding layout.
export function DashboardSkeleton() {
  return (
    <section role="status" aria-label="Loading dashboard" className="space-y-6">
      <span className="sr-only">Loading dashboard…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-xl border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-36 max-w-full" />
          </div>
        ))}
      </div>
      {/* Three rows reserve space for all five charts, including the full-width status panel. */}
      <div className="grid gap-6 lg:grid-cols-3" aria-hidden="true">
        {["lg:col-span-2", "", "lg:col-span-2", "", "lg:col-span-3"].map((className, index) => (
          <div key={index} className={`space-y-4 rounded-xl border bg-card p-6 ${className}`}>
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-4 w-60 max-w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
