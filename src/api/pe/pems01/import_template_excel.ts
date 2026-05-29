"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { gradeCriteriaToJson, scoreRangeFromCriteria } from "@/lib/grade-criteria";
import { ImportTemplatePayloadSchema } from "@/lib/excel/parse-evaluation-template";
import { normalizeRoundNameForSave } from "@/lib/round-name";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function parseFormDate(value: string): Date {
  return new Date(`${value.trim()}T12:00:00.000Z`);
}

/** นำเข้าโครงสร้างแบบประเมินจาก Excel (ไม่นำเข้าคะแนน) — สร้างใหม่หรืออัปเดตรอบ */
export async function importEvaluationTemplateExcel(
  raw: unknown,
): Promise<ActionResult<{ roundId: string }>> {
  const parsed = ImportTemplatePayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลนำเข้าไม่ถูกต้อง");
  }

  const {
    structure,
    templateName,
    evaluationYear,
    evaluationPeriod,
    startDate,
    endDate,
    importMode,
    roundId,
  } = parsed.data;

  const proportionTotal = structure.heads.reduce((sum, h) => sum + h.proportion, 0);
  if (Math.abs(proportionTotal - 100) > 0.001) {
    return fail(`สัดส่วนหัวข้อหลักรวม ${proportionTotal.toFixed(2)}% (ต้องรวม 100%)`);
  }

  const savedRoundName = normalizeRoundNameForSave(templateName, evaluationYear);

  try {
    const savedRoundId = await prisma.$transaction(async (tx) => {
      const writeHeads = async (roundPk: bigint) => {
        for (const head of structure.heads) {
          const createdHead = await tx.peEvaluationHead.create({
            data: {
              peEvaluationRound: roundPk,
              headTopic: head.headTopic.trim(),
              proportion: head.proportion,
              createdBy: null,
            },
          });
          for (const sub of head.subs) {
            const criteria = gradeCriteriaToJson(sub.details);
            const scoreRange = scoreRangeFromCriteria(criteria);
            await tx.peEvaluationSub.create({
              data: {
                peEvaluationHead: createdHead.id,
                subTopic: sub.subTopic.trim(),
                gradeCriteria: criteria,
                minScore: scoreRange.minScore,
                maxScore: scoreRange.maxScore,
                createdBy: null,
              },
            });
          }
        }
      };

      if (importMode === "update") {
        const roundPk = BigInt(roundId!);
        const round = await tx.peEvaluationRound.findUnique({
          where: { id: roundPk },
          include: {
            heads: {
              where: { active: true },
              include: { subs: { where: { active: true }, select: { id: true } } },
            },
          },
        });
        if (!round?.active) throw new Error("ROUND_NOT_FOUND");
        if (round.status === "closed") throw new Error("ROUND_CLOSED");

        const subIds = round.heads.flatMap((h) => h.subs.map((s) => s.id));
        if (subIds.length > 0) {
          const resultCount = await tx.peEvaluationResult.count({
            where: { peEvaluationSub: { in: subIds } },
          });
          if (resultCount > 0) {
            throw new Error("ROUND_HAS_RESULTS");
          }
        }

        await tx.peEvaluationRound.update({
          where: { id: roundPk },
          data: {
            roundName: savedRoundName,
            evaluationYear,
            evaluationPeriod,
            startDate: parseFormDate(startDate),
            endDate: parseFormDate(endDate),
          },
        });

        if (subIds.length > 0) {
          await tx.peEvaluationSub.updateMany({
            where: { id: { in: subIds } },
            data: { active: false },
          });
        }
        const headIds = round.heads.map((h) => h.id);
        if (headIds.length > 0) {
          await tx.peEvaluationHead.updateMany({
            where: { id: { in: headIds } },
            data: { active: false },
          });
        }

        await writeHeads(roundPk);
        return roundPk;
      }

      const master = await tx.peEvaluationTemplateMaster.create({
        data: {
          masterName: savedRoundName,
          description: "สร้างจากการนำเข้า Excel",
        },
      });

      const round = await tx.peEvaluationRound.create({
        data: {
          masterId: master.id,
          roundName: savedRoundName,
          evaluationYear,
          evaluationPeriod,
          startDate: parseFormDate(startDate),
          endDate: parseFormDate(endDate),
          status: "draft",
        },
      });

      await writeHeads(round.id);
      return round.id;
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/pe/pems01/form");

    return ok({ roundId: String(savedRoundId) });
  } catch (e) {
    if (e instanceof Error && e.message === "ROUND_NOT_FOUND") {
      return fail("ไม่พบรอบประเมินที่ต้องการอัปเดต");
    }
    if (e instanceof Error && e.message === "ROUND_CLOSED") {
      return fail("รอบนี้ปิดแล้ว — อัปเดตโครงสร้างจาก Excel ไม่ได้");
    }
    if (e instanceof Error && e.message === "ROUND_HAS_RESULTS") {
      return fail(
        "รอบนี้มีผลประเมินแล้ว — สร้างรอบใหม่แทน หรือลบผลประเมินก่อนอัปเดตโครงสร้าง",
      );
    }
    console.error("importEvaluationTemplateExcel", e);
    return fail("นำเข้าแบบประเมินจาก Excel ไม่สำเร็จ");
  }
}
