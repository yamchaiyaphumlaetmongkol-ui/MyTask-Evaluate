"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { verifyPassword } from "@/lib/auth/password";
import {
  backfillEmployeeAuthAccounts,
  ensureAdminAccount,
} from "@/lib/auth/provision-user";
import { createAppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export type LoginResult = {
  mustChangePassword: boolean;
  role: "admin" | "user";
};

export async function login(
  raw: unknown,
): Promise<ActionResult<LoginResult>> {
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const username = parsed.data.username.trim().toLowerCase();
  const password = parsed.data.password;

  try {
    await ensureAdminAccount();
    try {
      await backfillEmployeeAuthAccounts();
    } catch (backfillError) {
      console.error("login backfillEmployeeAuthAccounts", backfillError);
    }

    const user = await prisma.appUserAuth.findUnique({
      where: { username },
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
    console.error("login", e);
    return fail("เข้าสู่ระบบไม่สำเร็จ");
  }
}
