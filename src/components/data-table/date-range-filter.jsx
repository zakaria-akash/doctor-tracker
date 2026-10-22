"use client";

import { useId } from "react";
import { CalendarDays, X } from "lucide-react";
import { Popover } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const dateLabelFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// nuqs stores ISO dates as UTC-midnight calendar values, so input dates must use the same model.
function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function inputDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.valueOf())) return "";
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addCalendarDays(value, amount) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + amount),
  );
}

function rangeLabel(from, to) {
  if (!from && !to) return "Any date";
  if (from && to) return `${dateLabelFormatter.format(from)} – ${dateLabelFormatter.format(to)}`;
  return from
    ? `From ${dateLabelFormatter.format(from)}`
    : `Until ${dateLabelFormatter.format(to)}`;
}

function DateRangeFilter({ from, to, onChange, label = "Date range" }) {
  const id = useId();
  const today = new Date();
  // Encode the user's current calendar day as UTC fields without changing the visible day.
  const day = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const presets = [
    { label: "Today", from: day, to: day },
    { label: "Last 7 days", from: addCalendarDays(day, -6), to: day },
    { label: "Last 30 days", from: addCalendarDays(day, -29), to: day },
    {
      label: "This month",
      from: new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)),
      to: day,
    },
    { label: "This year", from: new Date(Date.UTC(today.getFullYear(), 0, 1)), to: day },
  ];

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button type="button" variant="outline" className="max-w-full justify-start font-normal">
          <CalendarDays aria-hidden="true" />
          <span className="truncate">{rangeLabel(from, to)}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          <Popover.Arrow className="fill-border" />
          <p className="text-sm font-semibold">{label}</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => onChange?.({ from: preset.from, to: preset.to })}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor={`${id}-from`} className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id={`${id}-from`}
                type="date"
                value={inputDate(from)}
                max={inputDate(to) || undefined}
                onChange={(event) => onChange?.({ from: parseDate(event.target.value), to })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`${id}-to`} className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id={`${id}-to`}
                type="date"
                value={inputDate(to)}
                min={inputDate(from) || undefined}
                onChange={(event) => onChange?.({ from, to: parseDate(event.target.value) })}
              />
            </div>
          </div>

          {from || to ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => onChange?.({ from: null, to: null })}
            >
              <X aria-hidden="true" />
              Clear dates
            </Button>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { DateRangeFilter };
