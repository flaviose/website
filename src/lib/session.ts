import { SignJWT, jwtVerify } from "jose";

// Pure token logic only — no next/headers, no pg — so this is safe to import
// from Edge middleware as well as Node route handlers.

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me"
);

export const COOKIE = "wb_session";

export type SessionUser = { id: string; email: string; name: string };

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(
  token?: string
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}
