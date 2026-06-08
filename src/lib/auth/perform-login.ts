import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { ensureAdminAccount } from "@/lib/auth/provision-user";
import { verifyPassword } from "@/lib/auth/password";
import { createAppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type LoginResult = {
  mustChangePassword: boolean;
  role: "admin" | "user";
};

export type AuthenticatedUser = LoginResult & {
  userId: bigint;
};

/** ตรวจสอบ username/password — ยังไม่สร้าง session */
export async function authenticateCredentials(
  username: string,
  password: string,
): Promise<ActionResult<AuthenticatedUser>> {
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

    return ok({
      userId: user.id,
      mustChangePassword: user.mustChangePassword,
      role: user.role,
    });
  } catch {
    console.error("authenticateCredentials failed");
    return fail("เข้าสู่ระบบไม่สำเร็จ");
  }
}

/** Server Action path — สร้าง session ผ่าน cookies() */
export async function performLogin(
  username: string,
  password: string,
): Promise<ActionResult<LoginResult>> {
  const auth = await authenticateCredentials(username, password);
  if (!auth.ok) return auth;

  try {
    await createAppSession(auth.data.userId);
    return ok({
      mustChangePassword: auth.data.mustChangePassword,
      role: auth.data.role,
    });
  } catch {
    console.error("performLogin session failed");
    return fail("เข้าสู่ระบบไม่สำเร็จ");
  }
}
