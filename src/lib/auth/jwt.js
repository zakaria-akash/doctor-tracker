import { jwtVerify } from "jose";

// Verify only the API's expected token type and return a minimal user object.
export async function verifySessionToken(token) {
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER ?? "doctor-tracker-api",
      audience: process.env.JWT_AUDIENCE ?? "doctor-tracker-web",
      requiredClaims: ["sub", "iat", "exp"],
    });

    // Only expose the identity fields and roles the frontend understands.
    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      !["admin", "viewer"].includes(payload.role)
    ) {
      return null;
    }

    return { id: payload.sub, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    // Missing, expired, tampered, or incorrectly configured tokens are not sessions.
    return null;
  }
}
