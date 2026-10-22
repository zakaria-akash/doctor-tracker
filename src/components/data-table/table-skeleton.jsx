import { Skeleton } from "@/components/ui/skeleton";

// Match the table/card geometry during the initial request to avoid layout movement.
function TableSkeleton({ columns = 6, rows = 10 }) {
  return (
    <div
      aria-label="Loading results"
      aria-busy="true"
      className="overflow-hidden rounded-xl border bg-card"
    >
      <span className="sr-only">Loading results</span>

      <div className="grid gap-3 p-3 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }, (_, rowIndex) => (
          <div key={rowIndex} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div
          className="grid h-11 items-center gap-4 border-b bg-muted/45 px-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Skeleton key={columnIndex} className="h-3 w-20 max-w-full" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid min-h-14 items-center gap-4 border-b px-4 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }, (_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={columnIndex === 0 ? "h-4 w-3/4" : "h-4 w-2/3"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { TableSkeleton };
