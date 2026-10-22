import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Condition colors are deliberately subdued; text remains the primary, accessible identifier.
const CONDITION_STYLES = [
  "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-300",
];

// Use a stable string hash so the same condition keeps the same color across views and renders.
function conditionStyle(value = "") {
  const index = [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
  return CONDITION_STYLES[index % CONDITION_STYLES.length];
}

function StatusBadge({ value, className }) {
  const label = STATUS_LABELS[value] ?? value ?? "Unknown";
  const style = STATUS_STYLES[value] ?? "bg-muted text-muted-foreground";

  return (
    <Badge className={cn("border-transparent", style, className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

function ConditionBadge({ value, className }) {
  return (
    <Badge variant="outline" className={cn(conditionStyle(value), className)}>
      {value || "Not specified"}
    </Badge>
  );
}

export { ConditionBadge, StatusBadge };
