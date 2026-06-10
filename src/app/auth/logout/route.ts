import { destroyAppSessionOnResponse } from "@/lib/auth/session";
import { NextResponse } from "next/server";

// POST: ใช้จาก form button (ป้องกัน Next.js prefetch ทำ logout โดยไม่ตั้งใจ)
export async function POST(request: Request) {
  const url = new URL("/auth/login", request.url);
  const response = NextResponse.redirect(url, 303);
  await destroyAppSessionOnResponse(response);
  return response;
}

// GET: รองรับ direct navigation, แต่ไม่ clear cookie ถ้าเป็น RSC prefetch
export async function GET(request: Request) {
  const isPrefetch =
    request.headers.get("rsc") === "1" ||
    request.headers.get("next-router-prefetch") === "1";
  const url = new URL("/auth/login", request.url);
  const response = NextResponse.redirect(url);
  if (!isPrefetch) {
    await destroyAppSessionOnResponse(response);
  }
  return response;
}
