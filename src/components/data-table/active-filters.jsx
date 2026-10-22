"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Each filter is `{ key, label, value? }`; empty entries are ignored by the caller or here.
function ActiveFilters({ filters = [], onClear, onClearAll }) {
  const visibleFilters = filters.filter(
    (filter) => filter && filter.value !== "" && filter.value != null,
  );
  if (visibleFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {visibleFilters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-muted/50 px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Remove ${filter.label} filter`}
          onClick={() => onClear?.(filter.key)}
        >
          <span>{filter.value === true ? filter.label : `${filter.label}: ${filter.value}`}</span>
          <X aria-hidden="true" className="size-3" />
        </button>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onClearAll?.()}>
        Reset all
      </Button>
    </div>
  );
}

export { ActiveFilters };
