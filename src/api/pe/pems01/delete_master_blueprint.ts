"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** ลบแม่แบบแบบ soft delete (จะไม่ลบถ้าถูกใช้งานในรอบประเมินแล้ว) */
export async function deleteMasterBlueprint(
  masterId: string,
): Promise<ActionResult<{ masterId: string }>> {
  try {
    const master = await prisma.peEvaluationTemplateMaster.findUnique({
      where: { id: BigInt(masterId) },
      include: {
        rounds: {
          where: { active: true },
          select: { id: true },
        },
        blueprintHeads: {
          where: { active: true },
          include: {
            subs: {
              where: { active: true },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!master?.active) {
      return fail("ไม่พบแม่แบบแบบประเมิน");
    }
    if (master.rounds.length > 0) {
      return fail("ไม่สามารถลบแม่แบบที่ถูกใช้สร้างรอบประเมินแล้ว");
    }

    await prisma.$transaction(async (tx) => {
      for (const head of master.blueprintHeads) {
        if (head.subs.length > 0) {
          await tx.peEvaluationMasterSub.updateMany({
            where: { id: { in: head.subs.map((sub) => sub.id) } },
            data: { active: false },
          });
        }
        await tx.peEvaluationPermission.deleteMany({
          where: {
            entityType: "head",
            entityId: head.id,
          },
        });
        await tx.peEvaluationMasterHead.update({
          where: { id: head.id },
          data: { active: false },
        });
      }

      await tx.peEvaluationTemplateMaster.update({
        where: { id: master.id },
        data: { active: false },
      });
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/pe/pems01/masters");
    revalidatePath("/pe/pems01/master/form");
    return ok({ masterId });
  } catch (e) {
    console.error("deleteMasterBlueprint", e);
    return fail("ลบแม่แบบไม่สำเร็จ");
  }
}
