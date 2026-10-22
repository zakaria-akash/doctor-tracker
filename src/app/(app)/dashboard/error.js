"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

// Keep analytics failures inside the dashboard so the rest of the application stays usable.
export default function DashboardError({ retry }) {
  return (
    <>
      <PageHeader title="Dashboard" description="An overview of your clinical workspace." />
      <section role="alert" className="rounded-xl border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 size-8 text-destructive" aria-hidden="true" />
        <h2 className="text-lg font-semibold">We could not load your overview</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Your records are safe. Please try loading the dashboard again.
        </p>
        {/* Next 16 retry refreshes the failed server request as well as its rendered output. */}
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
      </section>
    </>
  );
}
