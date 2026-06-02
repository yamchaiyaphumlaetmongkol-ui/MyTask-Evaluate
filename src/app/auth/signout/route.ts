import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
];

export async function GET(request: NextRequest) {
  try {
    const signInUrl = new URL("/api/auth/signin", request.url);
    const response = NextResponse.redirect(signInUrl);

    for (const name of SESSION_COOKIE_NAMES) {
      response.cookies.delete(name);
    }

    return response;
  } catch (error) {
    console.error("Sign-out failed:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
