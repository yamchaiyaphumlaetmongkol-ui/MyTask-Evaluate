"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** ปิดการใช้งานรอบประเมิน (soft delete) — ข้อมูลและผลประเมินยังอยู่ใน DB */
export async function deleteEvaluationTemplate(
  templateId: string,
): Promise<ActionResult<{ templateId: string }>> {
  try {
    const round = await prisma.peEvaluationRound.findUnique({
      where: { id: BigInt(templateId) },
      include: {
        heads: {
          where: { active: true },
          include: {
            subs: { where: { active: true }, select: { id: true } },
          },
        },
      },
    });

    if (!round?.active) return fail("ไม่พบรอบประเมิน");

    await prisma.$transaction(async (tx) => {
      for (const head of round.heads) {
        if (head.subs.length > 0) {
          await tx.peEvaluationSub.updateMany({
            where: { id: { in: head.subs.map((s) => s.id) } },
            data: { active: false },
          });
        }
        await tx.peEvaluationHead.update({
          where: { id: head.id },
          data: { active: false },
        });
      }
      await tx.peEvaluationRound.update({
        where: { id: round.id },
        data: { active: false },
      });
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/pe/pems01/form");
    revalidatePath("/ess/esspets01");
    revalidatePath("/ess/esspets02");
    revalidatePath("/ess/esspets03");
    revalidatePath("/ess/esspets04");
    return ok({ templateId });
  } catch (e) {
    console.error("deleteEvaluationTemplate", e);
    return fail("ลบรอบประเมินไม่สำเร็จ");
  }
}
