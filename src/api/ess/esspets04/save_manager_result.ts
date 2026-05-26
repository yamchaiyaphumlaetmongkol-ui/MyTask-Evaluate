"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { loadPermissionsFor } from "@/api/pe/pems01/_permission";
import { canEvaluateEmployee } from "@/lib/evaluation-permission";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Input = z.object({
  subId: z.string().min(1),
  employeeCode: z.string().min(1),
  managerCode: z.string().min(1),
  managerScore: z.coerce.number().min(0),
  managerDetail: z.string().optional().default(""),
});

export async function saveManagerEvalResult(
  raw: unknown,
): Promise<ActionResult<{ subId: string }>> {
  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { subId, employeeCode, managerCode, managerScore, managerDetail } =
    parsed.data;
  const subPk = BigInt(subId);

  try {
    const sub = await prisma.peEvaluationSub.findUnique({
      where: { id: subPk },
      select: {
        minScore: true,
        maxScore: true,
        active: true,
        peEvaluationHead: true,
      },
    });
    if (!sub?.active) return fail("ไม่พบหัวข้อย่อยการประเมิน");

    const [manager, perm] = await Promise.all([
      prisma.pmEmployee.findUnique({ where: { employeeCode: managerCode } }),
      loadPermissionsFor("head", sub.peEvaluationHead),
    ]);

    if (!manager?.active) return fail("ไม่พบข้อมูลผู้ประเมิน");
    if (
      !canEvaluateEmployee(perm, {
        roleCode: manager.roleCode,
        positionCode: manager.positionCode,
      })
    ) {
      return fail("ไม่มีสิทธิ์ประเมินหัวข้อนี้");
    }

    const min = Number(sub.minScore);
    const max = Number(sub.maxScore);
    if (managerScore < min || managerScore > max) {
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
        managerScore,
        managerDetail: managerDetail.trim() || null,
        managerEmployeeCode: managerCode,
      },
      update: {
        managerScore,
        managerDetail: managerDetail.trim() || null,
        managerEmployeeCode: managerCode,
      },
    });

    revalidatePath("/ess/esspets03");
    revalidatePath("/ess/esspets04");
    return ok({ subId });
  } catch (e) {
    console.error("saveManagerEvalResult", e);
    return fail("บันทึกผลประเมินไม่สำเร็จ");
  }
}
