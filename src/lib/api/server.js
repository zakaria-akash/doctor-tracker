import "server-only";

import { notFound, redirect } from "next/navigation";
import { getSessionToken } from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/jwt";
import { ApiError } from "./errors";
import { apiBase } from "./url";

// Server Components call Express directly; never trust a caller-provided token.
export async function serverFetch(
  path,
  { searchParams, method = "GET", body, allow404 = false } = {},
) {
  const base = new URL(apiBase());
  // Resolve only paths inside the configured backend prefix, then serialize filters.
  const url = new URL(path.replace(/^\/+/, ""), base);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
    throw new Error("API path must remain within API_URL");
  }
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined && value !== null && value !== "")
      url.searchParams.set(key, String(value));
  }

  const token = await getSessionToken();
  if (!(await verifySessionToken(token))) redirect("/login?expired=1");

  // Forward the verified session privately and avoid caching sensitive API data.
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  // Backend authorization remains authoritative, including deleted accounts.
  if (res.status === 401) redirect("/login?expired=1");
  if (res.status === 404 && allow404) notFound();
  if (res.status === 204) return null;

  // Preserve structured API errors for callers while handling non-JSON failures safely.
  const json = await res.json().catch(() => null);
  if (!res.ok)
    throw new ApiError(
      json?.error?.message ?? `Request failed (${res.status})`,
      res.status,
      json?.error,
    );
  return json;
}
