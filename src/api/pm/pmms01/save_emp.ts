"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { ensureEmployeeAuthAccount } from "@/lib/auth/provision-user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ImportUserSchema = z.object({
  clickupUserId: z.string().min(1),
  username: z.string().min(1),
  email: z.string().optional().nullable(),
  profilePicture: z.string().optional().nullable(),
});

const ImportSchema = z.object({
  users: z.array(ImportUserSchema).min(1),
});

const SyncClickUpSchema = z
  .object({
    importUsers: z.array(ImportUserSchema).default([]),
    removeEmployeeIds: z.array(z.string().min(1)).default([]),
  })
  .refine(
    (d) => d.importUsers.length > 0 || d.removeEmployeeIds.length > 0,
    { message: "ไม่มีการเปลี่ยนแปลง" },
  );

type ClickUpImportUser = z.infer<typeof ImportUserSchema>;

/** สร้างใหม่ หรือเปิดใช้งานพนักงานเดิมที่เคยนำออก */
async function upsertClickUpEmployee(
  u: ClickUpImportUser,
): Promise<string | null> {
  const existing = await prisma.pmEmployee.findFirst({
    where: { clickupUserId: u.clickupUserId },
  });

  const email = u.email?.trim() || `cu_${u.clickupUserId}@clickup.import`;
  const nameParts = u.username.trim().split(/\s+/);
  const firstName = nameParts[0] ?? u.username;
  const lastName = nameParts.slice(1).join(" ") || "—";
  const clickupData = {
    clickupUsername: u.username,
    clickupEmail: u.email ?? null,
    clickupProfileImage: u.profilePicture ?? null,
  };

  if (existing?.active) return null;

  if (existing) {
    await prisma.pmEmployee.update({
      where: { id: existing.id },
      data: {
        active: true,
        firstName,
        lastName,
        email: existing.email || email,
        ...clickupData,
      },
    });
    await ensureEmployeeAuthAccount(existing.id);
    return String(existing.id);
  }

  const created = await prisma.pmEmployee.create({
    data: {
      employeeCode: null,
      firstName,
      lastName,
      email,
      clickupUserId: u.clickupUserId,
      ...clickupData,
    },
  });
  await ensureEmployeeAuthAccount(created.id);
  return String(created.id);
}

const UpdateSchema = z.object({
  employeeId: z.string().min(1),
  employeeCode: z.string().optional().default(""),
  titleName: z.string().optional().default(""),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  roleCode: z.string().optional().default(""),
  positionCode: z.string().optional().default(""),
});

export async function importEmployeesFromClickUp(
  raw: unknown,
): Promise<ActionResult<{ imported: string[] }>> {
  const parsed = ImportSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  try {
    const imported: string[] = [];

    for (const u of parsed.data.users) {
      const id = await upsertClickUpEmployee(u);
      if (id) imported.push(id);
    }

    revalidatePath("/pm/pmms01");
    return ok({ imported });
  } catch (e) {
    console.error("importEmployeesFromClickUp", e);
    return fail("นำเข้าพนักงานไม่สำเร็จ");
  }
}

/** นำเข้า + นำออก (ยกเลิกเลือก) พนักงานจาก ClickUp ในครั้งเดียว */
export async function syncClickUpEmployees(
  raw: unknown,
): Promise<
  ActionResult<{ imported: string[]; removed: string[] }>
> {
  const parsed = SyncClickUpSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { importUsers, removeEmployeeIds } = parsed.data;
  const removed: string[] = [];
  const imported: string[] = [];

  try {
    for (const employeeId of removeEmployeeIds) {
      const current = await prisma.pmEmployee.findUnique({
        where: { id: BigInt(employeeId) },
      });
      if (!current?.active) continue;
      await prisma.pmEmployee.update({
        where: { id: current.id },
        data: { active: false },
      });
      removed.push(employeeId);
    }

    for (const u of importUsers) {
      const id = await upsertClickUpEmployee(u);
      if (id) imported.push(id);
    }

    if (imported.length > 0 || removed.length > 0) {
      revalidatePath("/pm/pmms01");
    }

    return ok({ imported, removed });
  } catch (e) {
    console.error("syncClickUpEmployees", e);
    return fail("บันทึกรายการจาก ClickUp ไม่สำเร็จ");
  }
}

export async function updateEmployee(
  raw: unknown,
): Promise<ActionResult<{ employeeId: string; employeeCode: string | null }>> {
  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const {
    employeeId,
    employeeCode: rawCode,
    titleName,
    firstName,
    lastName,
    roleCode,
    positionCode,
  } = parsed.data;

  const employeeCode = rawCode.trim() || null;

  try {
    const current = await prisma.pmEmployee.findUnique({
      where: { id: BigInt(employeeId) },
    });
    if (!current?.active) return fail("ไม่พบพนักงาน");

    if (employeeCode) {
      const dup = await prisma.pmEmployee.findFirst({
        where: {
          employeeCode,
          id: { not: current.id },
        },
      });
      if (dup) return fail("รหัสพนักงานซ้ำ");
    }

    await prisma.pmEmployee.update({
      where: { id: current.id },
      data: {
        employeeCode,
        titleName: titleName.trim() || null,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleCode: roleCode.trim() || null,
        positionCode: positionCode.trim() || null,
      },
    });

    revalidatePath("/pm/pmms01");
    revalidatePath(`/pm/pmms01/edit`);
    return ok({ employeeId, employeeCode });
  } catch (e) {
    console.error("updateEmployee", e);
    return fail("บันทึกพนักงานไม่สำเร็จ");
  }
}

export async function deleteEmployee(
  employeeId: string,
): Promise<ActionResult<{ employeeId: string }>> {
  try {
    await prisma.pmEmployee.update({
      where: { id: BigInt(employeeId) },
      data: { active: false },
    });
    revalidatePath("/pm/pmms01");
    return ok({ employeeId });
  } catch (e) {
    console.error("deleteEmployee", e);
    return fail("ลบพนักงานไม่สำเร็จ");
  }
}
