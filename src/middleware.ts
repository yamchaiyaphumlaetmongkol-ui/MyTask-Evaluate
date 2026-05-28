import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

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

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });
  const isLoggedIn = Boolean(token);

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
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
  ],
};
