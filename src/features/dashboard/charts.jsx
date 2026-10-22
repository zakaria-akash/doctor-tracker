"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/feedback/empty-state";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { CONDITIONS, STATUSES, STATUS_LABELS } from "@/lib/constants";
import { formatCompactNumber, formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

// Semantic tokens adapt charts to either theme without waiting for client-side theme detection.
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const STATUS_COLORS = {
  stable: "var(--chart-1)",
  under_observation: "var(--chart-3)",
  critical: "var(--chart-4)",
  recovered: "var(--chart-2)",
};
const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 };

// Chart summaries and empty states use actual counts; a zero-filled timeline is still empty.
function totalCount(rows) {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

function truncateLabel(value) {
  return value.length > 17 ? `${value.slice(0, 16)}…` : value;
}

// Tooltip values remain exact even when axis labels use compact notation or shortened names.
function ExactTooltip({ active, payload, label, unit = "patients" }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="max-w-64 rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{row.label ?? label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 tabular-nums">
          {payload.length > 1 ? `${item.name}: ` : ""}
          {formatNumber(item.value)} {unit}
        </p>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  description,
  summary,
  empty,
  children,
  legend,
  className,
  emptyDescription = "Try a wider date range or add patient records.",
}) {
  const titleId = useId();

  // A textual summary and named heading make every visualization understandable without color.
  return (
    <Card role="region" aria-labelledby={titleId} className={cn("min-w-0 gap-4", className)}>
      <CardHeader className="px-4 sm:px-6">
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        <CardDescription className="leading-5">{description}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-4 sm:px-6">
        {empty ? (
          <EmptyState
            title="No data to display"
            description={emptyDescription}
            className="min-h-72 border-0"
          />
        ) : (
          <>
            <div role="img" aria-label={summary} className="min-w-0">
              {children}
            </div>
            {legend}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AdmissionsChart({ rows }) {
  const gradientId = useId().replaceAll(":", "");

  // Backend periods are calendar keys in its configured timezone, not UTC instants to shift.
  const data = rows.map((row) => ({
    ...row,
    label: formatDate(
      row.period.length === 7 ? `${row.period}-01` : row.period,
      row.period.length === 7 ? "MMMM yyyy" : "dd MMM yyyy",
    ),
  }));

  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 300, height: 288 }}
      >
        <AreaChart
          data={data}
          margin={{ left: -8, right: 8, top: 12, bottom: 0 }}
          accessibilityLayer
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tick={AXIS_TICK}
            tickFormatter={(value) =>
              formatDate(
                value.length === 7 ? `${value}-01` : value,
                value.length === 7 ? "MMM yy" : "d MMM",
              )
            }
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={AXIS_TICK}
            tickFormatter={formatCompactNumber}
          />
          <Tooltip
            content={<ExactTooltip unit="admissions" />}
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
          />
          {/* Disable animations to respect reduced motion and make range comparisons immediate. */}
          <Area
            dataKey="count"
            name="Admissions"
            type="monotone"
            stroke="var(--chart-1)"
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function HorizontalBars({ rows, color, unit = "patients" }) {
  // Allocate a readable row for every category instead of squeezing all specializations together.
  const height = Math.max(288, rows.length * 32);

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 300, height }}
      >
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ left: 0, right: 12, top: 4, bottom: 0 }}
          accessibilityLayer
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={formatCompactNumber}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={truncateLabel}
          />
          <Tooltip
            content={<ExactTooltip unit={unit} />}
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          />
          <Bar
            dataKey="count"
            name={unit}
            fill={color}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ConditionDonut({ rows }) {
  const total = totalCount(rows);

  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 300, height: 256 }}
      >
        <PieChart accessibilityLayer>
          <Tooltip content={<ExactTooltip />} />
          <Pie
            data={rows}
            dataKey="count"
            nameKey="label"
            innerRadius="58%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="var(--card)"
            isAnimationActive={false}
          >
            {/* Each data row supplies its fill, avoiding the deprecated Recharts Cell API. */}
            <Label
              value={formatCompactNumber(total)}
              position="center"
              fill="var(--foreground)"
              fontSize={24}
              fontWeight={700}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryLegend({ rows, percent = false }) {
  const total = totalCount(rows);

  // Visible names and exact counts supplement chart colors for keyboard and screen-reader users.
  return (
    <ul className="mt-4 grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-1">
      {rows.map((row) => (
        <li key={row.label} className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: row.color }}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">{row.label}</span>
          <span className="shrink-0 font-medium tabular-nums">
            {formatNumber(row.count)}
            {percent && total > 0
              ? ` (${formatNumber(row.count / total, { style: "percent", maximumFractionDigits: 0 })})`
              : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

function StatusChart({ rows }) {
  // One stacked bar shows the status mix; its segments use the same palette as their legend.
  const data = [
    { label: "Selected period", ...Object.fromEntries(rows.map((row) => [row.status, row.count])) },
  ];

  return (
    <div className="h-36 w-full min-w-0">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 300, height: 144 }}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          accessibilityLayer
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={formatCompactNumber}
          />
          <YAxis type="category" dataKey="label" hide />
          <Tooltip content={<ExactTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
          {rows.map((row) => (
            <Bar
              key={row.status}
              dataKey={row.status}
              name={row.label}
              stackId="statuses"
              fill={row.color}
              maxBarSize={52}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// All charts consume the one server response; no chart starts its own analytics request.
export function DashboardCharts({ data }) {
  const timeline = data.patientsOverTime ?? [];
  const doctors = (data.patientsPerDoctor ?? []).map((row) => ({ ...row, label: row.name }));
  const specializations = (data.doctorsBySpecialization ?? []).map((row) => ({
    ...row,
    label: row.specialization,
  }));
  const conditions = (data.byCondition ?? []).map((row) => ({
    ...row,
    label: row.condition,
    color: CHART_COLORS[Math.max(0, CONDITIONS.indexOf(row.condition)) % CHART_COLORS.length],
    fill: CHART_COLORS[Math.max(0, CONDITIONS.indexOf(row.condition)) % CHART_COLORS.length],
  }));
  // Supply zeroes for absent statuses so their order and meaning do not jump between ranges.
  const statuses = STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: data.byStatus?.find((row) => row.status === status)?.count ?? 0,
    color: STATUS_COLORS[status],
  }));
  const admissions = totalCount(timeline);
  const critical = statuses.find((row) => row.label === STATUS_LABELS.critical)?.count ?? 0;

  return (
    <section aria-label="Dashboard charts" className="grid gap-6 lg:grid-cols-3">
      <ChartCard
        title="Patient admissions"
        description={`${formatNumber(admissions)} admissions in the selected period, grouped ${data.range?.unit === "day" ? "daily" : "monthly"}.`}
        summary={`Patient admissions over time. ${timeline.map((row) => `${row.period}: ${formatNumber(row.count)}`).join("; ")}.`}
        empty={admissions === 0}
        className="lg:col-span-2"
      >
        <AdmissionsChart rows={timeline} />
      </ChartCard>
      <ChartCard
        title="Patients by condition"
        description={
          conditions.length
            ? `${conditions[0].label} is the most common condition in this period.`
            : "Case mix for the selected period."
        }
        summary={`Patients by condition: ${conditions.map((row) => `${row.label}: ${formatNumber(row.count)}`).join("; ")}.`}
        empty={totalCount(conditions) === 0}
        legend={<CategoryLegend rows={conditions} percent />}
      >
        <ConditionDonut rows={conditions} />
      </ChartCard>
      <ChartCard
        title="Top doctors by patients"
        description={
          doctors.length
            ? `${doctors[0].label} has the most admissions in this period.`
            : "Up to ten doctors, ranked by admissions in this period."
        }
        summary={`Top doctors: ${doctors.map((row) => `${row.label}: ${formatNumber(row.count)} patients`).join("; ")}.`}
        empty={totalCount(doctors) === 0}
        className="lg:col-span-2"
      >
        <HorizontalBars rows={doctors} color="var(--chart-2)" />
      </ChartCard>
      <ChartCard
        title="Doctors by specialization"
        description="Current staffing across all records; independent of the date range."
        summary={`Doctors by specialization: ${specializations.map((row) => `${row.label}: ${formatNumber(row.count)}`).join("; ")}.`}
        empty={totalCount(specializations) === 0}
        emptyDescription="Add doctors to see your team's specialization coverage."
      >
        <HorizontalBars rows={specializations} color="var(--chart-5)" unit="doctors" />
      </ChartCard>
      <ChartCard
        title="Patient status breakdown"
        description={`${formatNumber(critical)} critical patients among admissions in the selected period.`}
        summary={`Patient status in the selected period: ${statuses.map((row) => `${row.label}: ${formatNumber(row.count)}`).join("; ")}.`}
        empty={totalCount(statuses) === 0}
        className="lg:col-span-3"
        legend={<CategoryLegend rows={statuses} />}
      >
        <StatusChart rows={statuses} />
      </ChartCard>
    </section>
  );
}
