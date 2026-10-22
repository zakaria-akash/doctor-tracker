import { getSessionToken } from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/jwt";
import { apiBase } from "@/lib/api/url";

// The browser can call only documented resources, never arbitrary upstream URLs or login.
// Exact path shapes also prevent traversal or an encoded slash from changing the destination.
const id = "[a-fA-F0-9]{24}";
const routes = [
  { pattern: /^auth\/me$/, methods: ["GET"] },
  { pattern: /^doctors$/, methods: ["GET", "POST"] },
  { pattern: new RegExp(`^doctors/${id}$`), methods: ["GET", "PATCH"] },
  { pattern: new RegExp(`^doctors/${id}/patients$`), methods: ["GET", "POST"] },
  { pattern: new RegExp(`^doctors/${id}/patients/${id}$`), methods: ["DELETE"] },
  { pattern: /^patients$/, methods: ["GET"] },
  { pattern: new RegExp(`^patients/${id}$`), methods: ["GET", "PATCH", "DELETE"] },
  { pattern: /^analytics\/overview$/, methods: ["GET"] },
  { pattern: /^meta\/options$/, methods: ["GET"] },
];
const MAX_BODY_BYTES = 100 * 1024;

// All responses are private: a shared browser/CDN cache must never retain patient data.
function fail(status, code, message, details) {
  return Response.json(
    { success: false, error: { code, message, ...(details && { details }) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

// Next can normalize nextUrl.hostname to localhost internally, even when the browser
// used another hostname. Compare against the incoming Host and the forwarded scheme
// instead; production's reverse proxy must set Host and X-Forwarded-Proto correctly.
function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const protocol = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol)
    .split(",")[0]
    .trim()
    .replace(/:$/, "")
    .toLowerCase();
  if (!origin || !host || !["http", "https"].includes(protocol)) return false;
  try {
    return origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}

// Limit the stream itself, not just Content-Length, which an attacker can omit or falsify.
async function readBody(request) {
  if (!request.body) return {};
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return { error: fail(415, "UNSUPPORTED_MEDIA_TYPE", "Use an application/json request body") };
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (declaredLength > MAX_BODY_BYTES) {
    return { error: fail(413, "PAYLOAD_TOO_LARGE", "Request body is too large") };
  }

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  // Stop reading as soon as the cumulative body exceeds the configured limit.
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return { error: fail(413, "PAYLOAD_TOO_LARGE", "Request body is too large") };
    }
    chunks.push(value);
  }
  if (!size) return {};

  // Reassemble and validate JSON before forwarding the original body upstream.
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const body = new TextDecoder().decode(bytes);
  try {
    JSON.parse(body);
  } catch {
    return { error: fail(400, "BAD_REQUEST", "Malformed JSON body") };
  }
  return { body };
}

async function forward(request, { params }) {
  // Next 16 supplies route params asynchronously, including catch-all segments.
  const { path } = await params;
  const subPath = path.join("/");
  const rule = routes.find(({ pattern }) => pattern.test(subPath));
  if (!rule) return fail(404, "NOT_FOUND", "Unknown API route");

  const method = request.method === "HEAD" ? "GET" : request.method;
  if (!rule.methods.includes(method)) return fail(405, "METHOD_NOT_ALLOWED", "Method not allowed");

  // SameSite cookies plus a strict Origin check protect browser mutations against CSRF.
  if (method !== "GET" && !isSameOrigin(request)) {
    return fail(403, "FORBIDDEN", "Invalid request origin");
  }

  // Route handlers are public endpoints: verify the cookie here, independently of proxy.js.
  const token = await getSessionToken();
  const user = await verifySessionToken(token);
  if (!user) return fail(401, "UNAUTHORIZED", "Not signed in");
  if (method !== "GET" && user.role !== "admin") {
    return fail(403, "FORBIDDEN", "You do not have permission to perform this action");
  }

  // The allowlisted DELETE endpoints identify the record entirely in the URL and accept no body.
  // Next can expose an empty DELETE stream; requiring JSON for it incorrectly rejects valid deletes.
  const { body, error } = ["GET", "DELETE"].includes(method) ? {} : await readBody(request);
  if (error) return error;

  // Only the server can read the cookie and API_URL; never forward incoming headers wholesale.
  let upstream;
  try {
    upstream = await fetch(new URL(`${subPath}${request.nextUrl.search}`, apiBase()), {
      method: request.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
    });
  } catch {
    return fail(503, "UPSTREAM_UNAVAILABLE", "The API is unreachable. Please retry in a moment.");
  }

  // Never expose an upstream redirect or development stack trace to the browser.
  if (upstream.status >= 300 && upstream.status < 400) {
    return fail(502, "UPSTREAM_ERROR", "The API returned an unexpected response");
  }
  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    const upstreamError = payload?.error;
    const details = upstreamError?.details;
    return fail(
      upstream.status,
      upstreamError?.code ?? "UPSTREAM_ERROR",
      upstreamError?.message ?? "The API request failed",
      details && { fieldErrors: details.fieldErrors, formErrors: details.formErrors },
    );
  }
  if (upstream.status === 204 || request.method === "HEAD") {
    return new Response(null, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export { forward as GET, forward as HEAD, forward as POST, forward as PATCH, forward as DELETE };
