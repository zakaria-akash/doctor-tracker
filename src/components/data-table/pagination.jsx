"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Keep the control compact while always exposing the first, last and nearby pages.
function paginationItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((item) => item > 0 && item <= totalPages).sort((a, b) => a - b);
  const items = [];

  sorted.forEach((item, index) => {
    const previous = sorted[index - 1];
    if (previous && item - previous > 1) items.push(`ellipsis-${previous}`);
    items.push(item);
  });
  return items;
}

function DataTablePagination({
  meta,
  onPageChange,
  onLimitChange,
  onPrefetchPage,
  disabled = false,
  className,
}) {
  const page = Math.max(1, meta?.page ?? 1);
  const limit = meta?.limit ?? PAGE_SIZES[0];
  const total = Math.max(0, meta?.total ?? 0);
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const hasPrevious = meta?.hasPrevPage ?? page > 1;
  const hasNext = meta?.hasNextPage ?? page < totalPages;

  return (
    <nav
      aria-label="Table pagination"
      className={cn(
        "flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {start}–{end}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Rows
          <select
            aria-label="Rows per page"
            value={limit}
            disabled={disabled}
            className="h-9 rounded-md border bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            onChange={(event) => onLimitChange?.(Number(event.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={disabled || !hasPrevious}
          onClick={() => onPageChange?.(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          {paginationItems(page, totalPages).map((item) =>
            typeof item === "string" ? (
              <span
                key={item}
                aria-hidden="true"
                className="grid size-9 place-items-center text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "ghost"}
                size="icon"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                disabled={disabled}
                onClick={() => onPageChange?.(item)}
              >
                {item}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={disabled || !hasNext}
          onFocus={() => hasNext && onPrefetchPage?.(page + 1)}
          onPointerEnter={() => hasNext && onPrefetchPage?.(page + 1)}
          onClick={() => onPageChange?.(page + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

export { DataTablePagination, paginationItems };
