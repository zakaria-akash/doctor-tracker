import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

// Convert API date strings and Date instances through one guarded path.
function toDate(value) {
  if (value == null || value === "") return new Date(Number.NaN);
  if (value instanceof Date) return value;
  if (typeof value === "string") return parseISO(value);
  return new Date(value);
}

export function formatDate(value, pattern = "dd MMM yyyy") {
  const date = toDate(value);
  return isValid(date) ? format(date, pattern) : "—";
}

export function formatDateTime(value) {
  return formatDate(value, "dd MMM yyyy, h:mm a");
}

export function formatRelativeDate(value) {
  const date = toDate(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

// Compact notation keeps dashboard and count pills readable while preserving locale separators.
export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat("en", options).format(Number(value) || 0);
}

export function formatCompactNumber(value) {
  return formatNumber(value, { notation: "compact", maximumFractionDigits: 1 });
}

// Return at most two initials and provide a stable fallback for missing names.
export function getInitials(name) {
  const initials = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "?";
}

// Convert API enum values into readable labels without requiring a lookup table for every filter.
export function humanize(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
