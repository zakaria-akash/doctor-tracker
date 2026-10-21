import { ApiError } from "./errors";

// Client requests always stay on this origin; the BFF adds the server-only bearer token.
export async function http(path, { method = "GET", params, body, signal } = {}) {
  const resource = path.replace(/^\/+/, "");
  if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(resource)) {
    throw new TypeError("Invalid API path");
  }
  // Omit empty filters instead of sending misleading values to the backend.
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }

  const response = await fetch(`/api/${resource}${query.size ? `?${query}` : ""}`, {
    method,
    signal,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Expired sessions must leave the protected screen and clear preserved route state on reload.
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      const from = `${window.location.pathname}${window.location.search}`;
      // A full reload clears React Activity's preserved protected UI and query cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?expired=1&from=${encodeURIComponent(from)}`);
    }
    throw new ApiError("Your session has expired", 401);
  }
  if (response.status === 204) return null;

  // Convert backend errors to a shared shape understood by forms and query hooks.
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? "Something went wrong",
      response.status,
      payload?.error,
    );
  }
  if (payload === null) throw new ApiError("The API returned an invalid response", 502);
  return payload;
}
