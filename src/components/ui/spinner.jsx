import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Pair the animated icon with hidden text so loading state is not communicated by motion alone.
function Spinner({ className, label = "Loading" }) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <LoaderCircle
        aria-hidden="true"
        className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
