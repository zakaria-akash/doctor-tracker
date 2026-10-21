import { Suspense } from "react";
import { Activity, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { LoginForm } from "./login-form";

// Content for the desktop-only introduction alongside the sign-in form.
const benefits = [
  {
    icon: HeartPulse,
    title: "One clear picture",
    description: "Keep care teams and patient records together.",
  },
  {
    icon: Activity,
    title: "See the bigger picture",
    description: "Follow activity and trends as your practice grows.",
  },
  {
    icon: ShieldCheck,
    title: "Access with confidence",
    description: "Role-based access helps protect sensitive information.",
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-700 to-indigo-800 p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px] opacity-10"
        />
        <div className="relative flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/20">
            <Stethoscope className="size-5" />
          </span>
          Doctor Tracker
        </div>
        <div className="relative my-auto max-w-xl py-20">
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-cyan-100 uppercase">
            A better view of care
          </p>
          <h1 className="text-5xl leading-tight font-semibold tracking-tight xl:text-6xl">
            Care, organised.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-cyan-50/85">
            A calmer way to bring your doctors, patients, and practice insights together.
          </p>
          <div className="mt-14 space-y-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-cyan-50/80">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-cyan-50/75">Built for the people behind better care.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 font-semibold lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Stethoscope className="size-5" />
            </span>
            Doctor Tracker
          </div>
          {/* The form reads the return URL on the client, so it needs Suspense. */}
          <Suspense
            fallback={
              <div
                className="h-96 animate-pulse rounded-xl border bg-muted"
                aria-label="Loading sign-in form"
              />
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
