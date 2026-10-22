import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

// The root not-found boundary also handles unmatched URLs across route groups.
export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <section className="w-full max-w-md space-y-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SearchX className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <p className="text-sm font-bold tracking-widest text-primary uppercase">404</p>
          <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The page may have moved, or the address may be incorrect.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </Button>
      </section>
    </main>
  );
}
