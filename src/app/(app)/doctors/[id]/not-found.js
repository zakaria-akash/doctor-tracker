import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

// Give mistyped, deleted, and unknown doctor IDs one useful recovery path.
export default function DoctorNotFound() {
  return (
    <section className="grid min-h-[55vh] place-items-center rounded-xl border border-dashed bg-card p-8 text-center">
      <div className="max-w-md space-y-4">
        <Stethoscope className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Doctor not found</h1>
          <p className="text-sm text-muted-foreground">
            This doctor may have been removed, or the link may be incorrect.
          </p>
        </div>
        <Button asChild>
          <Link href="/doctors">Back to doctors</Link>
        </Button>
      </div>
    </section>
  );
}
