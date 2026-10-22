import { Suspense } from "react";
import { DashboardCharts } from "@/features/dashboard/charts";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton";
import { KpiCards } from "@/features/dashboard/kpi-cards";
import { DASHBOARD_RANGES } from "@/features/dashboard/ranges";
import { serverFetch } from "@/lib/api/server";

export const metadata = { title: "Dashboard" };

// Keep the page shell static; only the analytics depend on the URL and private session.
export default function DashboardPage({ searchParams }) {
  return (
    <DashboardShell>
      {/* An unkeyed boundary retains the previous widgets during range transitions. */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </DashboardShell>
  );
}

async function DashboardContent({ searchParams }) {
  // Next 16 exposes searchParams as a promise; reject unknown ranges before calling the API.
  const { range } = await searchParams;
  const safeRange = DASHBOARD_RANGES.includes(range) ? range : "12m";

  // One authenticated request supplies every KPI and chart for this range.
  const { data } = await serverFetch("analytics/overview", {
    searchParams: { range: safeRange },
  });

  return (
    <div className="space-y-6">
      <KpiCards totals={data.totals} range={safeRange} />
      <DashboardCharts data={data} />
    </div>
  );
}
