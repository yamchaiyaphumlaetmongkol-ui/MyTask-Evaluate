import { destroyAppSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await destroyAppSession();
  const url = new URL("/auth/login", request.url);
  return NextResponse.redirect(url);
}
