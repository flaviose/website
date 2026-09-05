import { NextResponse, type NextRequest } from "next/server";
import { verifySession, COOKIE } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const user = await verifySession(req.cookies.get(COOKIE)?.value);
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

// Guard pages only. API routes check auth themselves (session for /readings,
// API key for /ingest), and /login must stay public.
export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico).*)"],
};
