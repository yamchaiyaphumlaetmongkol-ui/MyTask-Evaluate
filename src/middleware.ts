import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/server/auth/auth.config";

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
});

console.log(
  "[middleware] module loaded (src/middleware.ts) — AUTH_SECRET:",
  !!process.env.AUTH_SECRET,
);

function withDebugHeaders(
  res: NextResponse,
  decision:
    | "skip-api-auth"
    | "redirect-signin"
    | "allow-session"
    | "error-fallback-redirect",
) {
  try {
    res.headers.set("x-middleware-auth-debug", decision);
  } catch (e) {
    console.error("[middleware] failed to set debug header:", e);
  }
  return res;
}

export default auth((req) => {
  const { nextUrl } = req;
  const tag = `[middleware ${nextUrl.pathname}${nextUrl.search}]`;

  try {
    const isLoggedIn = !!req.auth;
    const host = req.headers.get("host");
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const userAgent = req.headers.get("user-agent");
    const referer = req.headers.get("referer");

    console.log(tag, {
      method: req.method,
      isLoggedIn,
      email: req.auth?.user?.email ?? null,
      userId: req.auth?.user?.id ?? null,
      host,
      forwardedHost,
      forwardedProto,
      referer,
      userAgent,
      authCookieNames: req.cookies
        .getAll()
        .map((c) => c.name)
        .filter((n) => /auth|session/i.test(n)),
      authCookieSizes: req.cookies
        .getAll()
        .filter((c) => /auth|session/i.test(c.name))
        .map((c) => ({ name: c.name, size: c.value.length })),
    });

    if (nextUrl.pathname.startsWith("/api/auth")) {
      console.log(tag, "SKIP (under /api/auth)");
      return withDebugHeaders(NextResponse.next(), "skip-api-auth");
    }

    if (!isLoggedIn) {
      const signInUrl = new URL("/api/auth/signin", nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", nextUrl.href);
      console.log(tag, "REDIRECT →", signInUrl.toString());
      return withDebugHeaders(
        NextResponse.redirect(signInUrl),
        "redirect-signin",
      );
    }

    console.log(tag, "ALLOW (has session)");
    return withDebugHeaders(NextResponse.next(), "allow-session");
  } catch (error) {
    console.error(tag, "CAUGHT ERROR — fail-closed → sign-in:", error);
    try {
      const signInUrl = new URL("/api/auth/signin", nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", nextUrl.href);
      return withDebugHeaders(
        NextResponse.redirect(signInUrl),
        "error-fallback-redirect",
      );
    } catch (fallbackErr) {
      console.error(tag, "fallback redirect failed:", fallbackErr);
      return NextResponse.next();
    }
  }
});

export const config = {
  matcher: [
    "/((?!api/|auth/signout|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
  ],
};
