"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// A search plus native select keeps doctor selection keyboard-accessible without another dependency.
export function DoctorSelect({ doctors = [], value, onChange, disabled = false }) {
  const id = useId();
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  // Always retain the selected option, even when a different name is being searched.
  const matches = doctors.filter(
    (doctor) => doctor.value === value || doctor.label.toLowerCase().includes(term),
  );

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`${id}-search`} className="text-xs text-muted-foreground">
        Find a doctor
      </Label>
      <Input
        id={`${id}-search`}
        placeholder="Search doctor names…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={disabled}
      />
      <Label htmlFor={`${id}-select`} className="text-xs text-muted-foreground">
        Doctor
      </Label>
      <select
        id={`${id}-select`}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="">All doctors</option>
        {value && !doctors.some((doctor) => doctor.value === value) ? (
          <option value={value}>Selected doctor</option>
        ) : null}
        {matches.map((doctor) => (
          <option key={doctor.value} value={doctor.value}>
            {doctor.label}
          </option>
        ))}
      </select>
      {search && matches.length === 0 ? (
        <p role="status" className="text-xs text-muted-foreground">
          No matching doctors.
        </p>
      ) : null}
    </div>
  );
}
