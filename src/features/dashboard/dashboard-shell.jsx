"use client";

import { Suspense, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DASHBOARD_RANGES, RANGE_LABELS } from "./ranges";

function RangeSelect({ startTransition, isPending }) {
  // A server navigation refreshes the single analytics request while React retains old content.
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(DASHBOARD_RANGES).withDefault("12m").withOptions({
      shallow: false,
      history: "push",
      scroll: false,
      startTransition,
    }),
  );

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <LoaderCircle
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      <label htmlFor="dashboard-range" className="text-sm font-medium">
        Date range
      </label>
      <select
        id="dashboard-range"
        value={range}
        onChange={(event) => void setRange(event.target.value)}
        className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {DASHBOARD_RANGES.map((value) => (
          <option key={value} value={value}>
            {RANGE_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  );
}

// The client wrapper controls pending feedback; children remain server-rendered analytics.
export function DashboardShell({ children }) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitor admissions, patient care and your clinical team."
        actions={
          <Suspense fallback={<Skeleton className="h-11 w-56" />}>
            <RangeSelect startTransition={startTransition} isPending={isPending} />
          </Suspense>
        }
      />
      {/* Announce loading once, while a visual dim leaves current numbers readable. */}
      <span role="status" className="sr-only">
        {isPending ? "Updating dashboard…" : ""}
      </span>
      <div
        aria-busy={isPending}
        className={cn(
          "transition-opacity motion-reduce:transition-none",
          isPending && "opacity-50",
        )}
      >
        {children}
      </div>
    </>
  );
}
