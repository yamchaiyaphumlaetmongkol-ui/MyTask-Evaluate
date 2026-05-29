"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import {
  buildPermissionRows,
  selectionFromPermissionRows,
} from "@/api/pe/pems01/_permission";
import { normalizeRoundNameForSave } from "@/lib/round-name";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DuplicateRoundSchema = z
  .object({
    sourceRoundId: z.string().min(1),
    templateName: z.string().min(1, "กรุณากรอกชื่อรอบ"),
    evaluationYear: z.coerce.number().int().min(2000).max(2100),
    evaluationPeriod: z.enum(["H1", "H2"]),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    status: z.enum(["draft", "open", "closed"]).default("draft"),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "วันเริ่มต้องไม่เกินวันสิ้นสุด",
    path: ["endDate"],
  });

function parseFormDate(value: string): Date {
  return new Date(`${value.trim()}T12:00:00.000Z`);
}

export async function duplicateEvaluationTemplate(
  raw: unknown,
): Promise<ActionResult<{ templateId: string }>> {
  const parsed = DuplicateRoundSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const {
    sourceRoundId,
    templateName,
    evaluationYear,
    evaluationPeriod,
    startDate,
    endDate,
    status,
  } = parsed.data;
  const trimmedTemplateName = templateName.trim();
  const roundName = normalizeRoundNameForSave(trimmedTemplateName, evaluationYear);

  try {
    const source = await prisma.peEvaluationRound.findUnique({
      where: { id: BigInt(sourceRoundId) },
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
    if (!source?.active) return fail("ไม่พบรอบต้นฉบับ");
    if (source.heads.length === 0) return fail("รอบต้นฉบับยังไม่มีหัวข้อประเมิน");

    const newRoundId = await prisma.$transaction(async (tx) => {
      const duplicatedRound = await tx.peEvaluationRound.findFirst({
        where: {
          active: true,
          roundName,
          evaluationYear,
          evaluationPeriod,
        },
        select: { id: true },
      });
      if (duplicatedRound) {
        throw new Error("DUPLICATE_PERIOD");
      }

      const master = await tx.peEvaluationTemplateMaster.create({
        data: {
          masterName: trimmedTemplateName,
          description: `ทำสำเนาจากรอบ ${source.id.toString()}`,
        },
      });

      const createdRound = await tx.peEvaluationRound.create({
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

      for (const head of source.heads) {
        const createdHead = await tx.peEvaluationHead.create({
          data: {
            peEvaluationRound: createdRound.id,
            headTopic: head.headTopic,
            proportion: head.proportion,
            createdBy: null,
          },
        });

        const permRows = await tx.peEvaluationPermission.findMany({
          where: {
            entityType: "head",
            entityId: head.id,
          },
          select: {
            permissionType: true,
            targetType: true,
            targetCode: true,
            isAll: true,
          },
        });
        const selection = selectionFromPermissionRows(permRows);
        const copiedPermRows = buildPermissionRows("head", createdHead.id, selection);
        if (copiedPermRows.length > 0) {
          await tx.peEvaluationPermission.createMany({
            data: copiedPermRows,
            skipDuplicates: true,
          });
        }

        for (const sub of head.subs) {
          await tx.peEvaluationSub.create({
            data: {
              peEvaluationHead: createdHead.id,
              subTopic: sub.subTopic,
              minScore: sub.minScore,
              maxScore: sub.maxScore,
              gradeCriteria: sub.gradeCriteria as Prisma.InputJsonValue,
              createdBy: null,
            },
          });
        }
      }

      return createdRound.id;
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/pe/pems01/form");
    revalidatePath("/ess/esspets01");
    revalidatePath("/ess/esspets02");
    revalidatePath("/ess/esspets03");
    revalidatePath("/ess/esspets04");
    return ok({ templateId: String(newRoundId) });
  } catch (e) {
    if (e instanceof Error && e.message === "DUPLICATE_PERIOD") {
      return fail("ชื่อรอบนี้มีช่วงประเมินนี้แล้ว (H1/H2 ห้ามซ้ำ)");
    }
    console.error("duplicateEvaluationTemplate", e);
    return fail("ทำสำเนารอบประเมินไม่สำเร็จ");
  }
}
