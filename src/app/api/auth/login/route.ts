import {
  attachSessionCookie,
  createSessionForUser,
} from "@/lib/auth/session";
import { authenticateCredentials } from "@/lib/auth/perform-login";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");

  const auth = await authenticateCredentials(username, password);

  if (!auth.ok) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", auth.error);
    return NextResponse.redirect(loginUrl, 303);
  }

  try {
    const token = await createSessionForUser(auth.data.userId);
    const target = auth.data.mustChangePassword
      ? "/auth/change-password"
      : "/";
    const response = NextResponse.redirect(new URL(target, request.url), 303);
    attachSessionCookie(response, token);
    return response;
  } catch (e) {
    console.error("POST /api/auth/login session failed", e);
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", "เข้าสู่ระบบไม่สำเร็จ");
    return NextResponse.redirect(loginUrl, 303);
  }
}
