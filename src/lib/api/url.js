import "server-only";

// API_URL is server-only and includes the backend's version prefix.
export function apiBase() {
  const configured = process.env.API_URL;
  if (!configured) throw new Error("API_URL is not set");

  // Reject credentials and URL suffixes so all requests use the intended API base.
  const url = new URL(configured);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("API_URL must be an HTTP(S) URL without credentials");
  }
  if (url.search || url.hash) throw new Error("API_URL must not include a query or fragment");
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.toString();
}
