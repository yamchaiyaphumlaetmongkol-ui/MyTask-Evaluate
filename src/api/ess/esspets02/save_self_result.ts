"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Input = z.object({
  subId: z.string().min(1),
  employeeCode: z.string().min(1),
  selfScore: z.coerce.number().min(0),
  selfDetail: z.string().optional().default(""),
});

export async function saveSelfEvalResult(
  raw: unknown,
): Promise<ActionResult<{ subId: string }>> {
  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { subId, employeeCode, selfScore, selfDetail } = parsed.data;
  const subPk = BigInt(subId);

  try {
    const sub = await prisma.peEvaluationSub.findUnique({
      where: { id: subPk },
      select: { minScore: true, maxScore: true, active: true },
    });
    if (!sub?.active) return fail("ไม่พบหัวข้อย่อยการประเมิน");

    const min = Number(sub.minScore);
    const max = Number(sub.maxScore);
    if (selfScore < min || selfScore > max) {
      return fail(`คะแนนต้องอยู่ระหว่าง ${min} – ${max}`);
    }

    await prisma.peEvaluationResult.upsert({
      where: {
        peEvaluationSub_employeeCode: {
          peEvaluationSub: subPk,
          employeeCode,
        },
      },
      create: {
        peEvaluationSub: subPk,
        employeeCode,
        selfScore,
        selfDetail: selfDetail.trim() || null,
      },
      update: {
        selfScore,
        selfDetail: selfDetail.trim() || null,
      },
    });

    revalidatePath("/ess/esspets02");
    revalidatePath("/ess/esspets03");
    revalidatePath("/ess/esspets04");
    return ok({ subId });
  } catch (e) {
    console.error("saveSelfEvalResult", e);
    return fail("บันทึกผลประเมินไม่สำเร็จ");
  }
}
