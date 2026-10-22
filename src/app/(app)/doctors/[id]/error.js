"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Route-level recovery keeps a temporary API failure from taking down the full app shell.
export default function DoctorProfileError({ retry }) {
  return (
    <section className="grid min-h-[55vh] place-items-center rounded-xl border border-dashed bg-card p-8 text-center">
      <div className="max-w-md space-y-4">
        <AlertTriangle className="mx-auto size-10 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Could not load this doctor</h1>
          <p className="text-sm text-muted-foreground">
            Check the API connection, then retry this profile.
          </p>
        </div>
        {/* Next 16.3+ exposes retry instead of the older reset callback. */}
        <Button type="button" onClick={() => retry()}>
          Retry
        </Button>
      </div>
    </section>
  );
}
