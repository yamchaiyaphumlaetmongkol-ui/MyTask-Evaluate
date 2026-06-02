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
    console.log(tag, "ALLOW (auth disabled)");
    return withDebugHeaders(NextResponse.next(), "allow-session");
  } catch (error) {
    console.error(tag, "CAUGHT ERROR — pass-through:", error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!api/|auth/signout|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
  ],
};
