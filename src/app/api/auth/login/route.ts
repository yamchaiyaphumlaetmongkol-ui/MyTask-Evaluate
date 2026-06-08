import { performLogin } from "@/lib/auth/perform-login";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");

  const result = await performLogin(username, password);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false as const, error: result.error },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true as const,
    data: result.data,
  });
}
