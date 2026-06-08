"use server";

import { changePasswordFromForm } from "@/lib/auth/change-password-core";
import type { ActionResult } from "@/api/_shared/action-result";
import { fail } from "@/api/_shared/action-result";
import { z } from "zod";

const ForcedChangeSchema = z
  .object({
    newPassword: z.string().min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "รหัสผ่านใหม่ไม่ตรงกัน",
    path: ["confirmPassword"],
  });

/** @deprecated ใช้ POST /api/auth/change-password แทน */
export async function changePassword(
  raw: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const parsed = ForcedChangeSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }
  return changePasswordFromForm(
    parsed.data.newPassword,
    parsed.data.confirmPassword,
  );
}
