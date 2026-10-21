import "server-only";

import { redirect } from "next/navigation";
import { getSessionToken } from "./session";
import { verifySessionToken } from "./jwt";

// Private caching allows this request-specific read within a Suspense boundary.
export async function getCurrentUser() {
  "use cache: private";

  const user = await verifySessionToken(await getSessionToken());
  if (!user) redirect("/login");
  return user;
}

// UI checks are conveniences; the backend still authorizes every mutation.
export async function requireRole(...roles) {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
