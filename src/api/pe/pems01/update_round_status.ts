"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { loadPermissionsForMany } from "@/api/pe/pems01/_permission";
import { getCurrentIdentityActor, mapIdentityError } from "@/lib/auth-identity";
import { templateHasEditAccess } from "@/lib/evaluation-permission";
import {
  isPastRoundEndDate,
  type EvaluationRoundStatus,
} from "@/lib/evaluation-round";
import { toDateOnlyString } from "@/lib/template-search";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateRoundStatusSchema = z.object({
  roundId: z.string().min(1),
  status: z.enum(["draft", "open", "closed"]),
});

export async function updateEvaluationRoundStatus(
  raw: unknown,
): Promise<ActionResult<{ roundId: string; status: EvaluationRoundStatus }>> {
  const parsed = UpdateRoundStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { roundId, status } = parsed.data;

  try {
    const actorContext = await getCurrentIdentityActor();
    if (!actorContext.binding && !actorContext.isAdmin) {
      return fail("ยังไม่พบการผูกตัวตน กรุณาเลือกผู้ใช้งาน");
    }

    const round = await prisma.peEvaluationRound.findUnique({
      where: { id: BigInt(roundId) },
      include: {
        heads: {
          where: { active: true },
          select: { id: true },
        },
      },
    });

    if (!round?.active) return fail("ไม่พบรอบประเมิน");

    const headIds = round.heads.map((head) => head.id);
    if (headIds.length === 0) {
      return fail("ไม่สามารถตรวจสิทธิ์แก้ไขรอบนี้ได้");
    }

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
    const canEdit =
      actorContext.isAdmin ||
      templateHasEditAccess(headPerms, {
        roleCode: actorContext.binding?.roleCode ?? null,
        positionCode: actorContext.binding?.positionCode ?? null,
      });
    if (!canEdit) {
      return fail("คุณไม่มีสิทธิ์เปลี่ยนสถานะรอบนี้");
    }

    if (isPastRoundEndDate(toDateOnlyString(round.endDate))) {
      return fail("รอบนี้หมดเวลาประเมินแล้ว — สถานะถูกปิดอัตโนมัติ");
    }

    await prisma.peEvaluationRound.update({
      where: { id: round.id },
      data: { status },
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/pe/pems01/form");
    revalidatePath("/ess/esspets01");
    revalidatePath("/ess/esspets02");
    revalidatePath("/ess/esspets03");
    revalidatePath("/ess/esspets04");

    return ok({ roundId, status });
  } catch (e) {
    const mapped = mapIdentityError(e);
    if (!mapped.ok && mapped.error !== "เกิดข้อผิดพลาดในการตรวจสอบตัวตน") {
      return mapped;
    }
    console.error("updateEvaluationRoundStatus", e);
    return fail("เปลี่ยนสถานะรอบไม่สำเร็จ");
  }
}
