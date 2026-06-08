"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { DEFAULT_USER_PASSWORD } from "@/lib/auth/constants";
import { requireCurrentUser } from "@/lib/auth/get-current-user";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ResetSchema = z.object({
  authId: z.string().min(1),
});

export async function adminResetUserPassword(
  raw: unknown,
): Promise<ActionResult<{ username: string }>> {
  const actor = await requireCurrentUser();
  if (!actor.isAdmin) {
    return fail("เฉพาะผู้ดูแลระบบเท่านั้น");
  }

  const parsed = ResetSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  try {
    const auth = await prisma.appUserAuth.findUnique({
      where: { id: BigInt(parsed.data.authId) },
    });
    if (!auth) return fail("ไม่พบบัญชีผู้ใช้");
    if (auth.role === "admin") {
      return fail("ไม่สามารถรีเซ็ตรหัสผ่าน admin ผ่านหน้านี้");
    }

    const passwordHash = await hashPassword(DEFAULT_USER_PASSWORD);
    await prisma.appUserAuth.update({
      where: { id: auth.id },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
    });

    await prisma.appSession.deleteMany({ where: { userId: auth.id } });

    revalidatePath("/admin/user-passwords");
    return ok({ username: auth.username });
  } catch (e) {
    console.error("adminResetUserPassword", e);
    return fail("รีเซ็ตรหัสผ่านไม่สำเร็จ");
  }
}
