import { changePasswordFromForm } from "@/lib/auth/change-password-core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  const result = await changePasswordFromForm(newPassword, confirmPassword);

  if (!result.ok) {
    const url = new URL("/auth/change-password", request.url);
    url.searchParams.set("error", result.error);
    return NextResponse.redirect(url, 303);
  }

  return NextResponse.redirect(new URL("/", request.url), 303);
}
