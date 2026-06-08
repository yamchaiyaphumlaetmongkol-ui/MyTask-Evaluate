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
    return NextResponse.json(
      { ok: false as const, error: auth.error },
      { status: 401 },
    );
  }

  try {
    const token = await createSessionForUser(auth.data.userId);
    const response = NextResponse.json({
      ok: true as const,
      data: {
        mustChangePassword: auth.data.mustChangePassword,
        role: auth.data.role,
      },
    });
    attachSessionCookie(response, token);
    return response;
  } catch {
    console.error("POST /api/auth/login session failed");
    return NextResponse.json(
      { ok: false as const, error: "เข้าสู่ระบบไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
