"use client";

import { Search, X } from "lucide-react";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// SearchInput is intentionally controlled so URL state remains the source of truth.
function SearchInput({ value, onChange, placeholder = "Search…", label = "Search", className }) {
  // A stable visible label remains available after the placeholder disappears while typing.
  const id = useId();
  const inputRef = useRef(null);
  return (
    <div className={cn("min-w-0 flex-1 space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          id={id}
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
            onClick={() => {
              // Clearing removes this button; restore focus to the still-present search input.
              onChange?.("");
              inputRef.current?.focus();
            }}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { SearchInput };
