"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Failed background refreshes must not silently leave users looking at stale clinical records.
// Keep the existing data visible and offer a retry without disrupting focus or filter state.
export function QueryFeedback({ error, onRetry, isFetching = false }) {
  if (!error) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
    >
      <AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        Could not refresh results. Previously loaded data is shown. {error.message}
      </p>
      <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={onRetry}>
        {isFetching ? "Retrying…" : "Retry"}
      </Button>
    </div>
  );
}
