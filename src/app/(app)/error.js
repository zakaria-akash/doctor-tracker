"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, retry }) {
  useEffect(() => {
    // Keep the full error in developer logs while the UI exposes only a safe reference.
    console.error("Application route error", error);
  }, [error]);

  return (
    <section
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center"
      role="alert"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          We could not load this page. Try again, or return to it from the navigation.
        </p>
        {error instanceof Error && error.digest && (
          <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
        )}
      </div>
      {/* Next 16.3+ retry re-fetches and re-renders the failed route segment. */}
      <Button type="button" onClick={() => retry()}>
        Try again
      </Button>
    </section>
  );
}
