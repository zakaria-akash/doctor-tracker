"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

// Demo buttons fill the real seeded credentials; authentication still uses the API.
const demos = {
  admin: { email: "admin@doctortracker.test", password: "Admin@12345" },
  viewer: { email: "viewer@doctortracker.test", password: "Viewer@12345" },
};

export function LoginForm() {
  // The server action owns validation and pending state; inputs remain editable locally.
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(loginAction, { ok: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function fillDemoCredentials(role) {
    setEmail(demos[role].email);
    setPassword(demos[role].password);
  }

  return (
    <Card className="border-border/70 shadow-lg shadow-slate-950/5">
      <CardHeader className="space-y-2">
        <p className="text-sm font-medium text-primary">Welcome back</p>
        <CardTitle className="text-2xl tracking-tight">Sign in to your account</CardTitle>
        <CardDescription>Enter your details to continue to Doctor Tracker.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {/* Preserve the requested destination and show server-side authentication errors. */}
          <input type="hidden" name="from" value={searchParams.get("from") ?? ""} />
          {searchParams.has("expired") && (
            <p
              role="status"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
            >
              Your session has ended. Please sign in again.
            </p>
          )}
          {state.message && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.message}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
              required
            />
            {state.fieldErrors?.email && (
              <p id="email-error" className="text-sm text-destructive">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(state.fieldErrors?.password)}
                aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
                className="pr-11"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((shown) => !shown)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-ring"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {state.fieldErrors?.password && (
              <p id="password-error" className="text-sm text-destructive">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        {/* Demo shortcuts only populate the form; they do not bypass authentication. */}
        <div className="mt-6 border-t pt-5">
          <p className="text-center text-xs text-muted-foreground">
            Exploring the demo? Choose an account to fill its details.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => fillDemoCredentials("admin")}
            >
              Use admin demo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => fillDemoCredentials("viewer")}
            >
              Use viewer demo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
