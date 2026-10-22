import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppShellSkeleton } from "@/components/layout/app-shell-skeleton";
import { UserProvider } from "@/components/providers/user-provider";
import { getCurrentUser } from "@/lib/auth/dal";

export default function AppLayout({ children }) {
  // Runtime cookie access stays below Suspense so the static shell fallback can stream immediately.
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <SessionScope>
        <AppShell>{children}</AppShell>
      </SessionScope>
    </Suspense>
  );
}

function SessionScope({ children }) {
  // Create, but do not await, the cached session promise; UserProvider unwraps it in client islands.
  return <UserProvider userPromise={getCurrentUser()}>{children}</UserProvider>;
}
