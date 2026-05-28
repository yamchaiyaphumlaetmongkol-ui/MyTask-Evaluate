import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { authConfig } from "@/server/auth/auth.config";

const { auth } = NextAuth({
  ...authConfig,
  secret: env.AUTH_SECRET,
});

function resolveRequestOrigin(req: Parameters<typeof auth>[0]): string {
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
  const isLoggedIn = Boolean(req.auth);

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
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
  ],
};
