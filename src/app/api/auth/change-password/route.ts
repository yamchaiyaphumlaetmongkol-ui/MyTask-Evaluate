import { changePasswordFromForm } from "@/lib/auth/change-password-core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  const result = await changePasswordFromForm(newPassword, confirmPassword);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false as const, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true as const });
}
