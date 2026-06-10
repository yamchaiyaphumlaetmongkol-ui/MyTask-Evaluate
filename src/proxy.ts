import { SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySignedSessionValue } from "@/lib/auth/signed-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/auth/login", "/auth/logout"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const hasSession = Boolean(token && verifySignedSessionValue(token));

  if (pathname.startsWith("/auth/change-password")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    if (hasSession && pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const login = new URL("/auth/login", req.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
  ],
};
