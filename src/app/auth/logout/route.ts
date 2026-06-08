import { destroyAppSessionOnResponse } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/auth/login", request.url);
  const response = NextResponse.redirect(url);
  await destroyAppSessionOnResponse(response);
  return response;
}
