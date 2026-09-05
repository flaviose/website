import { cookies } from "next/headers";
import { verifySession, COOKIE, type SessionUser } from "./session";

export { COOKIE };

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// cookies() is async in Next 15+, so these helpers are async too.
export async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, cookieOptions);
}

export async function clearSessionCookie() {
  (await cookies()).set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}
