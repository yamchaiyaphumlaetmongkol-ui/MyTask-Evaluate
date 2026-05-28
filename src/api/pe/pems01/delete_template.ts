"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { loadPermissionsForMany } from "@/api/pe/pems01/_permission";
import { getCurrentIdentityActor, mapIdentityError } from "@/lib/auth-identity";
import { templateHasEditAccess } from "@/lib/evaluation-permission";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** ลบรอบประเมินแบบ hard delete พร้อมข้อมูลที่ FK ถึงกัน */
export async function deleteEvaluationTemplate(
  templateId: string,
): Promise<ActionResult<{ templateId: string }>> {
  try {
    const actorContext = await getCurrentIdentityActor();
    if (!actorContext.binding && !actorContext.isAdmin) {
      return fail("ยังไม่พบการผูกตัวตน กรุณาเลือกผู้ใช้งาน");
    }

    const round = await prisma.peEvaluationRound.findUnique({
      where: { id: BigInt(templateId) },
      include: {
        heads: {
          include: {
            subs: { select: { id: true } },
          },
        },
      },
    });

    if (!round) return fail("ไม่พบรอบประเมิน");

    const headIds = round.heads.map((head) => head.id);
    const headPermMap = await loadPermissionsForMany("head", headIds);
    const headPerms = headIds.map(
      (id) =>
        headPermMap.get(String(id)) ?? {
          editAllRoles: false,
          editAllPositions: false,
          evaluateAllRoles: false,
          evaluateAllPositions: false,
          editRoleCodes: [],
          editPositionCodes: [],
          evaluateRoleCodes: [],
          evaluatePositionCodes: [],
        },
    );
    const canDelete =
      actorContext.isAdmin ||
      templateHasEditAccess(headPerms, {
        roleCode: actorContext.binding?.roleCode ?? null,
        positionCode: actorContext.binding?.positionCode ?? null,
      });
    if (!canDelete) {
      return fail("คุณไม่มีสิทธิ์แก้ไขเอกสารนี้ จึงไม่สามารถลบได้");
    }

    await prisma.$transaction(async (tx) => {
      const subIds = round.heads.flatMap((head) => head.subs.map((sub) => sub.id));

      if (subIds.length > 0) {
        await tx.peEvaluationResult.deleteMany({
          where: { peEvaluationSub: { in: subIds } },
        });
        await tx.peEvaluationSub.deleteMany({
          where: { id: { in: subIds } },
        });
      }

      if (headIds.length > 0) {
        await tx.peEvaluationPermission.deleteMany({
          where: {
            entityType: "head",
            entityId: { in: headIds },
          },
        });
        await tx.peEvaluationHead.deleteMany({
          where: { id: { in: headIds } },
        });
      }

      await tx.peEvaluationRound.delete({
        where: { id: round.id },
      });

      const remainingRounds = await tx.peEvaluationRound.count({
        where: { masterId: round.masterId },
      });
      if (remainingRounds > 0) return;

      const blueprintHeads = await tx.peEvaluationMasterHead.findMany({
        where: { masterId: round.masterId },
        include: { subs: { select: { id: true } } },
      });
      const blueprintHeadIds = blueprintHeads.map((head) => head.id);
      const blueprintSubIds = blueprintHeads.flatMap((head) =>
        head.subs.map((sub) => sub.id),
      );

      if (blueprintSubIds.length > 0) {
        await tx.peEvaluationMasterSub.deleteMany({
          where: { id: { in: blueprintSubIds } },
        });
      }
      if (blueprintHeadIds.length > 0) {
        await tx.peEvaluationPermission.deleteMany({
          where: {
            entityType: "head",
            entityId: { in: blueprintHeadIds },
          },
        });
        await tx.peEvaluationMasterHead.deleteMany({
          where: { id: { in: blueprintHeadIds } },
        });
      }

      await tx.peEvaluationTemplateMaster.delete({
        where: { id: round.masterId },
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
    const mapped = mapIdentityError(e);
    if (!mapped.ok && mapped.error !== "เกิดข้อผิดพลาดในการตรวจสอบตัวตน") {
      return mapped;
    }
    console.error("deleteEvaluationTemplate", e);
    return fail("ลบรอบประเมินไม่สำเร็จ");
  }
}
