import { NextResponse } from "next/server";

function withDebugHeaders(
  res: NextResponse,
  decision: "allow-pass-through" | "error-pass-through",
) {
  try {
    res.headers.set("x-middleware-auth-debug", decision);
  } catch (e) {
    console.error("[middleware] failed to set debug header:", e);
  }
  return res;
}

export default function middleware(req: Request) {
  const nextUrl = new URL(req.url);
  const tag = `[middleware ${nextUrl.pathname}${nextUrl.search}]`;

  try {
    console.log(tag, "ALLOW (auth disabled)");
    return withDebugHeaders(NextResponse.next(), "allow-pass-through");
  } catch (error) {
    console.error(tag, "CAUGHT ERROR — pass-through:", error);
    return withDebugHeaders(NextResponse.next(), "error-pass-through");
  }
}

export const config = {
  matcher: [
    "/((?!api/|auth/signout|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
  ],
};
