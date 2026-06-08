"use server";

import { fail, type ActionResult } from "@/api/_shared/action-result";
import {
  performLogin,
  type LoginResult,
} from "@/lib/auth/perform-login";
import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

/** @deprecated ใช้ POST /api/auth/login แทน */
export async function login(
  raw: unknown,
): Promise<ActionResult<LoginResult>> {
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }
  return performLogin(parsed.data.username, parsed.data.password);
}

export type { LoginResult };
