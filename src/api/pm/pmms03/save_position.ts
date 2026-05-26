"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PositionFields = z.object({
  positionCode: z.string().min(1, "กรุณากรอกรหัสตำแหน่ง"),
  positionName: z.string().min(1, "กรุณากรอกชื่อตำแหน่ง"),
  description: z.string().optional().default(""),
  status: z.string().optional().default("active"),
});

const CreateSchema = PositionFields;

const UpdateSchema = PositionFields.extend({
  positionId: z.string().min(1),
});

export async function savePosition(
  raw: unknown,
): Promise<ActionResult<{ positionCode: string }>> {
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const d = parsed.data;
  try {
    await prisma.pmPosition.create({
      data: {
        positionCode: d.positionCode.trim(),
        positionName: d.positionName.trim(),
        description: d.description.trim() || null,
        status: d.status.trim() || "active",
      },
    });
    revalidatePath("/pm/pmms03");
    return ok({ positionCode: d.positionCode.trim() });
  } catch (e) {
    console.error("savePosition", e);
    return fail("บันทึกตำแหน่งไม่สำเร็จ — อาจซ้ำรหัส");
  }
}

export async function updatePosition(
  raw: unknown,
): Promise<ActionResult<{ positionId: string }>> {
  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { positionId, ...fields } = parsed.data;
  const positionCode = fields.positionCode.trim();

  try {
    const current = await prisma.pmPosition.findUnique({
      where: { id: BigInt(positionId) },
    });
    if (!current?.active) return fail("ไม่พบตำแหน่ง");

    const dup = await prisma.pmPosition.findFirst({
      where: { positionCode, id: { not: current.id } },
    });
    if (dup) return fail("รหัสตำแหน่งซ้ำ");

    await prisma.pmPosition.update({
      where: { id: current.id },
      data: {
        positionCode,
        positionName: fields.positionName.trim(),
        description: fields.description.trim() || null,
        status: fields.status.trim() || "active",
      },
    });

    revalidatePath("/pm/pmms03");
    return ok({ positionId });
  } catch (e) {
    console.error("updatePosition", e);
    return fail("แก้ไขตำแหน่งไม่สำเร็จ");
  }
}

export async function deletePosition(
  positionId: string,
): Promise<ActionResult<{ positionId: string }>> {
  try {
    const current = await prisma.pmPosition.findUnique({
      where: { id: BigInt(positionId) },
    });
    if (!current?.active) return fail("ไม่พบตำแหน่ง");

    await prisma.pmPosition.update({
      where: { id: current.id },
      data: { active: false },
    });

    revalidatePath("/pm/pmms03");
    return ok({ positionId });
  } catch (e) {
    console.error("deletePosition", e);
    return fail("ลบตำแหน่งไม่สำเร็จ");
  }
}
