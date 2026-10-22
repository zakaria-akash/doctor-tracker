import Link from "next/link";
import { Activity, HeartPulse, Stethoscope, TrendingUp, Users } from "lucide-react";
import { formatCompactNumber, formatNumber } from "@/lib/format";
import { RANGE_LABELS } from "./ranges";

// Null growth means no comparable prior period, not 0% growth or an infinite increase.
function trendDescription(change, range) {
  if (range === "all") return "All recorded admissions";
  if (change == null) return "No previous-period baseline";
  if (change === 0) return "No change vs previous period";
  return `${change > 0 ? "+" : ""}${formatNumber(change, { maximumFractionDigits: 1 })}% vs previous period`;
}

export function KpiCards({ totals, range }) {
  // Only new admissions follow the range; the backend's other totals cover all current records.
  const cards = [
    {
      label: "Total doctors",
      value: totals.doctors,
      detail: "Across all specializations",
      icon: Stethoscope,
      href: "/doctors",
    },
    {
      label: "Total patients",
      value: totals.patients,
      detail: "All current patient records",
      icon: Users,
      href: "/patients",
    },
    {
      label: "New admissions",
      value: totals.newPatients,
      detail: trendDescription(totals.newPatientsChangePct, range),
      icon: TrendingUp,
      range: RANGE_LABELS[range],
    },
    {
      label: "Critical now",
      value: totals.critical,
      detail: "Current critical patient records",
      icon: HeartPulse,
      href: "/patients?status=critical",
      critical: true,
    },
    {
      label: "Patients / doctor",
      value: totals.avgPatientsPerDoctor,
      detail: "Average across all current records",
      icon: Activity,
      average: true,
    },
  ];

  return (
    <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        ({ label, value, detail, icon: Icon, href, critical, average, range: rangeLabel }) => {
          // Preserve exact values in accessible text even when large visual values use compact notation.
          const content = (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
                <Icon
                  aria-hidden="true"
                  className={`size-5 shrink-0 ${critical ? "text-rose-600 dark:text-rose-400" : "text-primary"}`}
                />
              </div>
              <p
                className="mt-3 text-3xl font-bold tracking-tight tabular-nums"
                aria-label={formatNumber(value, { maximumFractionDigits: 1 })}
              >
                {average
                  ? formatNumber(value, { maximumFractionDigits: 1 })
                  : formatCompactNumber(value)}
              </p>
              {rangeLabel && <p className="mt-1 text-xs font-medium text-primary">{rangeLabel}</p>}
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
            </>
          );
          const className = "min-w-0 rounded-xl border bg-card p-5 shadow-sm";

          // Count cards link to the matching lists, allowing users to inspect the underlying records.
          return href ? (
            <Link
              key={label}
              href={href}
              className={`${className} transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
            >
              {content}
            </Link>
          ) : (
            <article key={label} className={className}>
              {content}
            </article>
          );
        },
      )}
    </section>
  );
}
