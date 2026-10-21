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

export const PATIENT_SORTS = ["newest", "oldest", "name_asc", "name_desc", "age_asc", "age_desc"];
// Keep shareable filters in the URL using the same names accepted by the API.
export const patientFilterParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  condition: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  gender: parseAsString.withDefault(""),
  doctor: parseAsString.withDefault(""),
  minAge: parseAsInteger,
  maxAge: parseAsInteger,
  from: parseAsIsoDate,
  to: parseAsIsoDate,
  sort: parseAsStringLiteral(PATIENT_SORTS).withDefault("newest"),
};

export function usePatientFilters() {
  const [filters, setFilters] = useQueryStates(patientFilterParsers);
  const search = useDebouncedValue(filters.search);
  // Clamp pagination and translate calendar dates to the user's full local day.
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
