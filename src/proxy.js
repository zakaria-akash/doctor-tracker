import { NextResponse } from "next/server";
import { PUBLIC_ROUTES, SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";

// Only a confirmed backend rejection can invalidate an otherwise valid session.
async function sessionRejectedByApi(token) {
  try {
    const base = new URL(process.env.API_URL);
    if (
      !["http:", "https:"].includes(base.protocol) ||
      base.username ||
      base.password ||
      base.search ||
      base.hash
    ) {
      return false;
    }
    if (!base.pathname.endsWith("/")) base.pathname += "/";
    const response = await fetch(new URL("auth/me", base), {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    return response.status === 401;
  } catch {
    // An unavailable or misconfigured backend must not log the user out.
    return false;
  }
}

// Proxy is an optimistic navigation check; the DAL and backend check again.
export async function proxy(request) {
  const { pathname, search, searchParams } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await verifySessionToken(token);

  // An arbitrary expired link cannot clear a session still accepted by the API.
  if (isPublic && searchParams.has("expired")) {
    if (!user || (await sessionRejectedByApi(token))) {
      const response = NextResponse.next();
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  // Remember the original path so a successful login can return the user there.
  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (user && isPublic) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

// The BFF authenticates separately, and static assets do not need a session.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
