import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

// Cookie access stays on the server; the browser never receives the token as data.
export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionCookie(token, expiresAt) {
  // Restrict script access and cross-site requests; production cookies require HTTPS.
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSessionCookie() {
  // Deleting the same named cookie ends the browser's session.
  (await cookies()).delete(SESSION_COOKIE);
}
