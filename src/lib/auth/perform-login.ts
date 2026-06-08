import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { ensureAdminAccount } from "@/lib/auth/provision-user";
import { verifyPassword } from "@/lib/auth/password";
import { createAppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type LoginResult = {
  mustChangePassword: boolean;
  role: "admin" | "user";
};

/** ตรวจสอบ username/password และสร้าง session — ไม่ log รหัสผ่าน */
export async function performLogin(
  username: string,
  password: string,
): Promise<ActionResult<LoginResult>> {
  const normalized = username.trim().toLowerCase();
  if (!normalized || !password) {
    return fail("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
  }

  try {
    await ensureAdminAccount();

    const user = await prisma.appUserAuth.findUnique({
      where: { username: normalized },
    });
    if (!user) {
      return fail("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return fail("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }

    await createAppSession(user.id);

    return ok({
      mustChangePassword: user.mustChangePassword,
      role: user.role,
    });
  } catch (e) {
    console.error("performLogin failed");
    return fail("เข้าสู่ระบบไม่สำเร็จ");
  }
}
