"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { copyMasterBlueprintToRound } from "@/api/pe/pems01/_copy_master_to_round";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatRoundLabel } from "@/lib/evaluation-round";
import { prisma } from "@/lib/prisma";
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

    const periodLabel = formatEvaluationPeriod(evaluationPeriod);
    const roundName = formatRoundLabel(
      master.masterName,
      evaluationYear,
      evaluationPeriod,
      periodLabel,
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
