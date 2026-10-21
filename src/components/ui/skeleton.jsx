import { cn } from "@/lib/utils";

// Show a loading placeholder; only animate when the user allows motion.
function Skeleton({ className, ...props }) {
  return <div data-slot="skeleton" className={cn("rounded-md bg-accent motion-safe:animate-pulse", className)} {...props} />;
}

export { Skeleton };
