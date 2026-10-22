import { Skeleton } from "@/components/ui/skeleton";

// Match the final profile geometry closely to avoid a large layout shift while streaming.
export function DoctorProfileSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading doctor profile" aria-busy="true">
      <section className="space-y-5 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      </section>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
