"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "./table-skeleton";

// Controls inside a row must keep their own behavior instead of triggering row navigation.
const INTERACTIVE_SELECTOR = "a,button,input,select,textarea,[role='button'],[role='link']";

function DataTable({
  columns,
  data = [],
  isPending = false,
  isFetching = false,
  emptyState,
  renderMobileCard,
  getRowHref,
  getRowKey = (row, index) => row.id ?? row._id ?? index,
  caption = "Results",
  className,
}) {
  const router = useRouter();

  if (isPending) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (data.length === 0) {
    return emptyState ?? null;
  }

  // Navigate only when the row itself was activated, never when a nested control was clicked.
  function openRow(event, row) {
    const href = getRowHref?.(row);
    const nestedControl = event.target.closest?.(INTERACTIVE_SELECTOR);
    if (!href || (nestedControl && nestedControl !== event.currentTarget)) return;
    router.push(href);
  }

  return (
    <div
      aria-busy={isFetching}
      className={cn("relative overflow-hidden rounded-xl border bg-card", className)}
    >
      {isFetching ? (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/20">
          <div className="h-full w-1/3 rounded-full bg-primary motion-safe:animate-pulse" />
        </div>
      ) : null}

      {/* Cards keep dense table content readable on narrow screens. */}
      <div
        className={cn("grid gap-3 p-3 transition-opacity md:hidden", isFetching && "opacity-60")}
      >
        {data.map((row, index) => {
          const href = getRowHref?.(row);
          return (
            <div
              key={getRowKey(row, index)}
              role={href ? "link" : undefined}
              tabIndex={href ? 0 : undefined}
              className={cn(
                "rounded-lg border bg-background p-4 shadow-xs",
                href &&
                  "cursor-pointer outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring",
              )}
              onClick={href ? (event) => openRow(event, row) : undefined}
              onKeyDown={
                href
                  ? (event) => {
                      if (event.key === "Enter" && event.currentTarget === event.target) {
                        router.push(href);
                      }
                    }
                  : undefined
              }
            >
              {renderMobileCard ? renderMobileCard(row) : null}
            </div>
          );
        })}
      </div>

      {/* The semantic table appears from the medium breakpoint upward. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b bg-muted/45 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key ?? column.accessorKey}
                  scope="col"
                  className={cn("h-11 px-4", column.headerClassName)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn("divide-y transition-opacity", isFetching && "opacity-60")}>
            {data.map((row, rowIndex) => {
              const href = getRowHref?.(row);
              return (
                <tr
                  key={getRowKey(row, rowIndex)}
                  tabIndex={href ? 0 : undefined}
                  className={cn(
                    "transition-colors",
                    href &&
                      "cursor-pointer outline-none hover:bg-muted/35 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  )}
                  onClick={href ? (event) => openRow(event, row) : undefined}
                  onKeyDown={
                    href
                      ? (event) => {
                          if (event.key === "Enter" && event.currentTarget === event.target) {
                            router.push(href);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((column) => {
                    const key = column.key ?? column.accessorKey;
                    const content = column.cell ? column.cell(row) : row[column.accessorKey];
                    return (
                      <td key={key} className={cn("px-4 py-3 align-middle", column.className)}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { DataTable };
