"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Accept either strings or `{ value, label }` objects to keep filter definitions concise.
function normalizeOption(option) {
  return typeof option === "string" ? { value: option, label: option } : option;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel = "All",
  disabled = false,
  className,
}) {
  const id = useId();

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          disabled={disabled}
          className="h-9 w-full appearance-none rounded-md border bg-background pr-9 pl-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          onChange={(event) => onChange?.(event.target.value)}
        >
          <option value="">{allLabel}</option>
          {options.map((rawOption) => {
            const option = normalizeOption(rawOption);
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}

export { FilterSelect };
