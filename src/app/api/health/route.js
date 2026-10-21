import { connection } from "next/server";
import { apiBase } from "@/lib/api/url";

// Uptime checks need the current API/database state, never a prerendered build-time result.
export async function GET() {
  await connection();
  try {
    const response = await fetch(new URL("health", apiBase()), {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    const payload = await response.json().catch(() => null);
    // Report healthy only when the backend and its database are both available.
    const healthy = response.ok && payload?.data?.db === "up";
    return Response.json(
      { frontend: "ok", api: healthy ? "ok" : "degraded" },
      { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { frontend: "ok", api: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
