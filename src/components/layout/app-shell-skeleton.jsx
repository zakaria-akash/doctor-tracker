import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the permanent shell while the request-specific session is verified.
export function AppShellSkeleton() {
  return (
    <div className="flex min-h-dvh bg-background" aria-label="Loading application">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar p-4 md:block">
        <Skeleton className="mb-8 h-10 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
          <Skeleton className="size-9" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ml-auto h-9 w-28" />
        </div>
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <PageLoadingSkeleton />
        </div>
      </div>
    </div>
  );
}

// Page-shaped rows prevent layout shift during streamed route transitions.
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
