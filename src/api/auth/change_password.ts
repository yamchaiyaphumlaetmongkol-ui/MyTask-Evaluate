"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
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

/** เปลี่ยนรหัสผ่านได้เฉพาะเมื่อ admin รีเซ็ต (mustChangePassword) */
export async function changePassword(
  raw: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const parsed = ForcedChangeSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const user = await getCurrentUser();
  if (!user) return fail("กรุณาเข้าสู่ระบบ");

  const auth = await prisma.appUserAuth.findUnique({
    where: { id: BigInt(user.authId) },
  });
  if (!auth) return fail("ไม่พบบัญชีผู้ใช้");

  if (!auth.mustChangePassword) {
    return fail("ไม่สามารถเปลี่ยนรหัสผ่านเองได้ กรุณาติดต่อผู้ดูแลระบบ");
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.appUserAuth.update({
    where: { id: auth.id },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  });

  return ok({ ok: true });
}
