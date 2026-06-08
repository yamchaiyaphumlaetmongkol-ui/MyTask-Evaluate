import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function changePasswordFromForm(
  newPassword: string,
  confirmPassword: string,
): Promise<ActionResult<{ ok: true }>> {
  if (!newPassword || newPassword.length < 8) {
    return fail("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
  }
  if (newPassword !== confirmPassword) {
    return fail("รหัสผ่านใหม่ไม่ตรงกัน");
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

  const passwordHash = await hashPassword(newPassword);
  await prisma.appUserAuth.update({
    where: { id: auth.id },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  });

  return ok({ ok: true });
}
