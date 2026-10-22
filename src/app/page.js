import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowRight, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";

// Keep the public entry page useful before a visitor signs in to the private clinic workspace.
const features = [
  {
    icon: Users,
    title: "A connected care team",
    description: "Keep doctor details, specialties, and patient assignments together.",
  },
  {
    icon: HeartPulse,
    title: "Patient records in context",
    description: "Find the right record quickly and see who is responsible for each patient.",
  },
  {
    icon: Activity,
    title: "Practice insights at a glance",
    description: "Follow admissions, care status, and trends from one clear dashboard.",
  },
];

export const metadata = {
  title: "Care, organised",
  description:
    "A calmer workspace for clinical teams to coordinate doctors, patient records, and practice insights.",
};

export default function Home() {
  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Public navigation leads visitors to the existing sign-in flow without exposing private data. */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="size-5" aria-hidden="true" />
          </span>
          <span>Doctor Tracker</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-6">
          <Link
            href="#features"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Platform
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Open workspace
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </nav>
      </header>

      {/* The hero balances a concise product promise with the locally optimized clinic photograph. */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />A clearer view of
            care
          </p>
          <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Care teams focused on people, not paperwork.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Bring doctors, patient records, and day-to-day practice insights into one calm,
            well-organised workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-transform hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Sign in to your workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="#features"
              className="inline-flex min-h-12 items-center rounded-lg border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Explore the platform
            </a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Role-aware access for the people behind better care
          </p>
        </div>

        <div className="relative isolate aspect-[1.24] overflow-hidden rounded-3xl border bg-muted shadow-2xl shadow-primary/10 sm:aspect-[1.45]">
          <Image
            src="/images/clinic/doctor-team.webp"
            alt="Two clinicians reviewing a patient chart together in a bright clinic"
            fill
            sizes="(max-width: 1024px) 100vw, 56vw"
            preload
            className="object-cover object-[62%_center]"
          />
          {/* A subtle wash supports the floating caption while preserving the generated photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-white/10"
          />
          <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-4 text-white sm:right-6 sm:bottom-6 sm:left-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-white/75 uppercase">
                One connected workspace
              </p>
              <p className="mt-1 text-lg font-semibold sm:text-xl">More time for better care.</p>
            </div>
            <span className="hidden size-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur sm:grid">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>

      {/* Short feature cards explain the actual Doctors, Patients, and Analytics areas in the app. */}
      <section id="features" className="border-y bg-card/70">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
              Made for daily coordination
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              The essentials, brought together.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="rounded-2xl border bg-background p-6 shadow-sm transition-transform hover:-translate-y-1"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  0{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Keep the closing call to action consistent with the account flow already in the product. */}
      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>Doctor Tracker · A clearer view of everyday care.</p>
        <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-primary">
          Go to sign in
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </footer>
    </main>
  );
}
