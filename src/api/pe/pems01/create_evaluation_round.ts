"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import {
  buildPermissionRows,
  selectionFromPermissionRows,
} from "@/api/pe/pems01/_permission";
import { copyMasterBlueprintToRound } from "@/api/pe/pems01/_copy_master_to_round";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { normalizeRoundNameForSave } from "@/lib/round-name";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateRoundSchema = z
  .object({
    masterId: z.string().min(1),
    evaluationYear: z.coerce.number().int().min(2000).max(2100),
    evaluationPeriod: z.enum(["H1", "H2"]),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    status: z.enum(["draft", "open", "closed"]).default("open"),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "วันเริ่มต้องไม่เกินวันสิ้นสุด",
    path: ["endDate"],
  });

function parseFormDate(value: string): Date {
  return new Date(`${value.trim()}T12:00:00.000Z`);
}

async function bootstrapMasterBlueprintFromLatestRound(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  masterId: bigint,
): Promise<void> {
  const headCount = await tx.peEvaluationMasterHead.count({
    where: { masterId, active: true },
  });
  if (headCount > 0) return;

  const sourceRound = await tx.peEvaluationRound.findFirst({
    where: {
      masterId,
      active: true,
      heads: { some: { active: true } },
    },
    orderBy: [{ evaluationYear: "desc" }, { id: "desc" }],
    include: {
      heads: {
        where: { active: true },
        orderBy: { id: "asc" },
        include: {
          subs: { where: { active: true }, orderBy: { id: "asc" } },
        },
      },
    },
  });
  if (!sourceRound) return;

  for (const roundHead of sourceRound.heads) {
    const createdHead = await tx.peEvaluationMasterHead.create({
      data: {
        masterId,
        headTopic: roundHead.headTopic,
        proportion: roundHead.proportion,
      },
    });

    const roundPermRows = await tx.peEvaluationPermission.findMany({
      where: {
        entityType: "head",
        entityId: roundHead.id,
      },
      select: {
        permissionType: true,
        targetType: true,
        targetCode: true,
        isAll: true,
      },
    });
    const perm = selectionFromPermissionRows(roundPermRows);
    const rows = buildPermissionRows("head", createdHead.id, perm);
    if (rows.length > 0) {
      await tx.peEvaluationPermission.createMany({
        data: rows,
        skipDuplicates: true,
      });
    }

    for (const roundSub of roundHead.subs) {
      await tx.peEvaluationMasterSub.create({
        data: {
          masterHeadId: createdHead.id,
          subTopic: roundSub.subTopic,
          minScore: roundSub.minScore,
          maxScore: roundSub.maxScore,
          gradeCriteria: roundSub.gradeCriteria as Prisma.InputJsonValue,
        },
      });
    }
  }
}

/** เปิดรอบประเมินใหม่จากแม่แบบ — คัดลอกโครงสร้าง snapshot */
export async function createEvaluationRound(
  raw: unknown,
): Promise<ActionResult<{ roundId: string }>> {
  const parsed = CreateRoundSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const {
    masterId,
    evaluationYear,
    evaluationPeriod,
    startDate,
    endDate,
    status,
  } = parsed.data;

  try {
    const master = await prisma.peEvaluationTemplateMaster.findUnique({
      where: { id: BigInt(masterId), active: true },
    });
    if (!master) {
      return fail("ไม่พบแม่แบบแบบประเมิน");
    }

    const roundName = normalizeRoundNameForSave(
      master.masterName,
      evaluationYear,
    );

    const roundId = await prisma.$transaction(async (tx) => {
      const existing = await tx.peEvaluationRound.findFirst({
        where: {
          masterId: master.id,
          evaluationYear,
          evaluationPeriod,
        },
      });
      if (existing) {
        throw new Error("DUPLICATE_ROUND");
      }

      // รองรับข้อมูลเก่าที่มี master แต่ไม่มี blueprint head/sub
      await bootstrapMasterBlueprintFromLatestRound(tx, master.id);

      const round = await tx.peEvaluationRound.create({
        data: {
          masterId: master.id,
          roundName,
          evaluationYear,
          evaluationPeriod,
          startDate: parseFormDate(startDate),
          endDate: parseFormDate(endDate),
          status,
        },
      });

      await copyMasterBlueprintToRound(tx, master.id, round.id);
      return round.id;
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/ess/esspets01");
    revalidatePath("/ess/esspets02");
    revalidatePath("/ess/esspets03");
    revalidatePath("/ess/esspets04");

    return ok({ roundId: String(roundId) });
  } catch (e) {
    if (e instanceof Error && e.message === "DUPLICATE_ROUND") {
      return fail(
        `มีรอบ ${evaluationYear} ${formatEvaluationPeriod(evaluationPeriod)} ของแม่แบบนี้แล้ว`,
      );
    }
    console.error("createEvaluationRound", e);
    return fail("สร้างรอบประเมินไม่สำเร็จ");
  }
}
