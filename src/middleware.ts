import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/server/auth/auth.config";

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});

type MiddlewareRequest = {
  headers: Headers;
  nextUrl: { origin: string };
};

function resolveRequestOrigin(req: MiddlewareRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const proto = forwardedProto ?? "https";
    return `${proto}://${forwardedHost}`;
  }

  return req.nextUrl.origin;
}

export default auth((req) => {
  const { nextUrl } = req;
  const tag = `[middleware ${nextUrl.pathname}${nextUrl.search}]`;

  try {
    const isLoggedIn = !!req.auth;

    console.log(tag, {
      method: req.method,
      isLoggedIn,
      email: req.auth?.user?.email ?? null,
      authCookieNames: req.cookies
        .getAll()
        .map((c) => c.name)
        .filter((n) => /auth|session/i.test(n)),
    });

    if (nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      const origin = resolveRequestOrigin(req);
      const signInUrl = new URL("/api/auth/signin", origin);
      const callbackUrl = new URL(
        `${nextUrl.pathname}${nextUrl.search}`,
        origin,
      ).toString();
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
      
      console.log(tag, "REDIRECT →", signInUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error(tag, "CAUGHT ERROR — fail-closed → sign-in:", error);
    try {
      const origin = resolveRequestOrigin(req);
      const signInUrl = new URL("/api/auth/signin", origin);
      const callbackUrl = new URL(
        `${nextUrl.pathname}${nextUrl.search}`,
        origin,
      ).toString();
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(signInUrl);
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
