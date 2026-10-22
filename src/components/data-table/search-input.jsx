"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// SearchInput is intentionally controlled so URL state remains the source of truth.
function SearchInput({ value, onChange, placeholder = "Search…", label = "Search", className }) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value ?? ""}
        aria-label={label}
        placeholder={placeholder}
        className="pr-10 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
        onChange={(event) => onChange?.(event.target.value)}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Clear ${label.toLowerCase()}`}
          className="absolute top-1/2 right-0.5 size-8 -translate-y-1/2 text-muted-foreground"
          onClick={() => onChange?.("")}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

export { SearchInput };
