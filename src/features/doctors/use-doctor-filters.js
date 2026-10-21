"use client";

import {
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { localDayBoundary } from "@/hooks/date-boundaries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export const DOCTOR_SORTS = ["newest", "oldest", "name_asc", "name_desc"];
// Keep filters shareable in the URL using names accepted by the backend.
export const doctorFilterParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  specialization: parseAsString.withDefault(""),
  hospital: parseAsString.withDefault(""),
  from: parseAsIsoDate,
  to: parseAsIsoDate,
  sort: parseAsStringLiteral(DOCTOR_SORTS).withDefault("newest"),
};

export function useDoctorFilters() {
  const [filters, setFilters] = useQueryStates(doctorFilterParsers);
  const search = useDebouncedValue(filters.search);

  // Debounce searches, clamp pagination and convert dates to full local-day boundaries.
  const apiParams = {
    ...filters,
    page: Math.max(1, filters.page),
    limit: Math.min(100, Math.max(1, filters.limit)),
    search,
    from: localDayBoundary(filters.from),
    to: localDayBoundary(filters.to, true),
  };
  return { filters, setFilters, apiParams };
}
