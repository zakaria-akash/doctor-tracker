import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/dal";
import { LogoutButton } from "./logout-button";

export const metadata = { title: "Dashboard" };

// A small protected landing page makes the login flow testable before the real dashboard phase.
export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl items-center px-6 py-12">
      {/* Session cookies are request-time data, so Next 16 requires a Suspense boundary. */}
      <Suspense fallback={<p className="text-muted-foreground">Checking your session…</p>}>
        <SessionStatus />
      </Suspense>
    </main>
  );
}

async function SessionStatus() {
  // The DAL verifies the token again; the proxy redirect alone is not authorization.
  const user = await getCurrentUser();

  return (
    <section className="w-full space-y-5 rounded-xl border bg-card p-8 shadow-sm">
      <p className="text-sm font-semibold text-primary">Doctor Tracker</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <p className="text-sm text-muted-foreground">
          You are signed in as {user.role}. The full dashboard and management pages are coming in
          the next phases.
        </p>
      </div>
      <LogoutButton />
    </section>
  );
}
