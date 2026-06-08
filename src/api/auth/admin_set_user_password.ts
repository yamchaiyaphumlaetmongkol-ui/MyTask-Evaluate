"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { requireCurrentUser } from "@/lib/auth/get-current-user";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SetPasswordSchema = z.object({
  authId: z.string().min(1),
  newPassword: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

export async function adminSetUserPassword(
  raw: unknown,
): Promise<ActionResult<{ username: string }>> {
  const actor = await requireCurrentUser();
  if (!actor.isAdmin) {
    return fail("เฉพาะผู้ดูแลระบบเท่านั้น");
  }

  const parsed = SetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  try {
    const auth = await prisma.appUserAuth.findUnique({
      where: { id: BigInt(parsed.data.authId) },
    });
    if (!auth) return fail("ไม่พบบัญชีผู้ใช้");

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.appUserAuth.update({
      where: { id: auth.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    await prisma.appSession.deleteMany({ where: { userId: auth.id } });

    revalidatePath("/admin/user-passwords");
    return ok({ username: auth.username });
  } catch (e) {
    console.error("adminSetUserPassword", e);
    return fail("ตั้งรหัสผ่านไม่สำเร็จ");
  }
}
