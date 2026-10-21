"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { apiBase } from "@/lib/api/url";
import { verifySessionToken } from "@/lib/auth/jwt";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";

// Validate again on the server, including requests that bypass the form UI.
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required"),
  from: z.string().optional(),
});

// Only relative same-origin paths can be used as a post-login destination.
function safeRedirect(path) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(path)
  ) {
    return "/dashboard";
  }

  const base = "https://doctor-tracker.invalid";
  const destination = new URL(path, base);
  return destination.origin === base
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : "/dashboard";
}

export async function loginAction(_previousState, formData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password, from } = parsed.data;
  let response;
  try {
    // Credentials are sent directly to the configured API and never cached.
    response = await fetch(new URL("auth/login", apiBase()), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, message: "The authentication service is unreachable. Please try again." };
  }

  // Surface the API's error message without assuming every response is valid JSON.
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: json?.error?.message ?? "Unable to sign in. Please try again." };
  }

  // Do not persist malformed or unverifiable sessions returned by the API.
  const token = json?.data?.token;
  const expiresAt = json?.data?.expiresAt;
  if (
    !(await verifySessionToken(token)) ||
    !Number.isFinite(Date.parse(expiresAt)) ||
    Date.parse(expiresAt) <= Date.now()
  ) {
    return {
      ok: false,
      message: "The authentication service returned an invalid session. Please try again.",
    };
  }

  await setSessionCookie(token, expiresAt);
  // Next.js redirects throw internally, so this stays outside the fetch catch.
  redirect(safeRedirect(from));
}

// Client shells can clear their query state and perform a full reload afterwards.
export async function clearSessionAction() {
  await clearSessionCookie();
}
