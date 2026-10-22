import { cn } from "@/lib/utils";

// Deterministic color choices make long doctor lists easier to scan without storing avatar data.
const AVATAR_STYLES = [
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
];

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function colorIndex(value) {
  return (
    [...value].reduce((total, character) => total + character.charCodeAt(0), 0) %
    AVATAR_STYLES.length
  );
}

// Initials remain useful when the API intentionally has no profile-image field.
export function DoctorAvatar({ name, specialization = "", className }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold",
        AVATAR_STYLES[colorIndex(specialization || name)],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
