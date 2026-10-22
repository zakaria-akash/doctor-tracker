import { Suspense } from "react";
import { Activity, Stethoscope, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata = { title: "Dashboard" };

// A small protected landing page makes the login flow testable before the real dashboard phase.
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick starting point for your clinical operations workspace."
      />
      {/* Session cookies are request-time data, so Next 16 requires a Suspense boundary. */}
      <Suspense fallback={<p className="text-sm text-muted-foreground">Checking your session…</p>}>
        <SessionStatus />
      </Suspense>
    </>
  );
}

async function SessionStatus() {
  // The DAL verifies the token again; the proxy redirect alone is not authorization.
  const user = await getCurrentUser();

  return (
    <section className="space-y-6">
      {/* Keep Phase 4's landing state useful without implementing the Phase 7 analytics dashboard. */}
      <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-primary">Doctor Tracker</p>
        <h2 className="mt-2 text-2xl font-semibold">Welcome, {user.name}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          You are signed in as {user.role}. Doctor management is ready; patient management and
          analytics arrive in the next phases.
        </p>
      </div>

      {/* Compact route summaries introduce the shell navigation without duplicating future KPIs. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardHint
          icon={Stethoscope}
          title="Doctors"
          text="Search and manage doctor records."
        />
        <DashboardHint icon={Users} title="Patients" text="Patient management is coming next." />
        <DashboardHint icon={Activity} title="Analytics" text="Dashboard insights arrive later." />
      </div>
    </section>
  );
}

function DashboardHint({ icon: Icon, title, text }) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </article>
  );
}
