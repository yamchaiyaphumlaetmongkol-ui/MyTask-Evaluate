"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RoleFields = z.object({
  roleCode: z.string().min(1, "กรุณากรอกรหัสบทบาท"),
  roleName: z.string().min(1, "กรุณากรอกชื่อบทบาท"),
  roleLevel: z.coerce.number().int().optional().nullable(),
  roleDescription: z.string().optional().default(""),
  roleStatus: z.string().optional().default("active"),
});

const CreateSchema = RoleFields;

const UpdateSchema = RoleFields.extend({
  roleId: z.string().min(1),
});

export async function saveRole(
  raw: unknown,
): Promise<ActionResult<{ roleCode: string }>> {
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const d = parsed.data;
  try {
    await prisma.pmRole.create({
      data: {
        roleCode: d.roleCode.trim(),
        roleName: d.roleName.trim(),
        roleLevel: d.roleLevel ?? null,
        roleDescription: d.roleDescription.trim() || null,
        roleStatus: d.roleStatus.trim() || "active",
      },
    });
    revalidatePath("/pm/pmms02");
    return ok({ roleCode: d.roleCode.trim() });
  } catch (e) {
    console.error("saveRole", e);
    return fail("บันทึกบทบาทไม่สำเร็จ — อาจซ้ำรหัส");
  }
}

export async function updateRole(
  raw: unknown,
): Promise<ActionResult<{ roleId: string }>> {
  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { roleId, ...fields } = parsed.data;
  const roleCode = fields.roleCode.trim();

  try {
    const current = await prisma.pmRole.findUnique({
      where: { id: BigInt(roleId) },
    });
    if (!current?.active) return fail("ไม่พบบทบาท");

    const dup = await prisma.pmRole.findFirst({
      where: { roleCode, id: { not: current.id } },
    });
    if (dup) return fail("รหัสบทบาทซ้ำ");

    await prisma.pmRole.update({
      where: { id: current.id },
      data: {
        roleCode,
        roleName: fields.roleName.trim(),
        roleLevel: fields.roleLevel ?? null,
        roleDescription: fields.roleDescription.trim() || null,
        roleStatus: fields.roleStatus.trim() || "active",
      },
    });

    revalidatePath("/pm/pmms02");
    return ok({ roleId });
  } catch (e) {
    console.error("updateRole", e);
    return fail("แก้ไขบทบาทไม่สำเร็จ");
  }
}

export async function deleteRole(
  roleId: string,
): Promise<ActionResult<{ roleId: string }>> {
  try {
    const current = await prisma.pmRole.findUnique({
      where: { id: BigInt(roleId) },
    });
    if (!current?.active) return fail("ไม่พบบทบาท");

    await prisma.pmRole.update({
      where: { id: current.id },
      data: { active: false },
    });

    revalidatePath("/pm/pmms02");
    return ok({ roleId });
  } catch (e) {
    console.error("deleteRole", e);
    return fail("ลบบทบาทไม่สำเร็จ");
  }
}
