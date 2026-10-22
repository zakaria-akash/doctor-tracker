// Shared with Proxy, so this module must remain compatible with its runtime.
export const SESSION_COOKIE = "dt_session";
// The marketing entry page and sign-in screen are accessible without a session.
export const PUBLIC_ROUTES = ["/", "/login"];
