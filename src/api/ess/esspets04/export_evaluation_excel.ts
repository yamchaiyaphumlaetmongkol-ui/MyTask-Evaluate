"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { queryManagerEvalQueueList } from "@/api/ess/esspets04/_queries";
import { buildEvaluationExportWorkbook } from "@/lib/excel/build-evaluation-export";
import { employeeDisplayName } from "@/lib/employee-display";
import { parseGradeCriteria } from "@/lib/grade-criteria";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ExportSchema = z.object({
  managerCode: z.string().min(1),
  employeeCode: z.string().min(1),
  templateId: z.string().min(1),
});

export async function exportEvaluationExcel(
  raw: unknown,
): Promise<ActionResult<{ fileName: string; mimeType: string; base64: string }>> {
  const parsed = ExportSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูล export ไม่ถูกต้อง");
  }

  const { managerCode, employeeCode, templateId } = parsed.data;
  const queue = await queryManagerEvalQueueList(managerCode, {
    employeeCode,
    roundId: templateId,
  });
  const row = queue.find((r) => r.employeeCode === employeeCode && r.templateId === templateId);
  if (!row) return fail("ไม่พบรายการที่มีสิทธิ์ export");
  if (row.documentStatus !== "completed") {
    return fail("export ได้เฉพาะรายการที่ประเมินเสร็จแล้ว (completed)");
  }

  const round = await prisma.peEvaluationRound.findUnique({
    where: { id: BigInt(templateId), active: true },
    include: {
      heads: {
        where: { active: true },
        orderBy: { id: "asc" },
        include: { subs: { where: { active: true }, orderBy: { id: "asc" } } },
      },
    },
  });
  if (!round) return fail("ไม่พบรอบประเมิน");

  const employee = await prisma.pmEmployee.findUnique({
    where: { employeeCode, active: true },
  });
  if (!employee) return fail("ไม่พบข้อมูลพนักงาน");
  const manager = await prisma.pmEmployee.findUnique({
    where: { employeeCode: managerCode, active: true },
  });

  const subIds = round.heads.flatMap((h) => h.subs.map((s) => s.id));
  const results = await prisma.peEvaluationResult.findMany({
    where: { employeeCode, peEvaluationSub: { in: subIds } },
    select: {
      peEvaluationSub: true,
      selfScore: true,
      selfDetail: true,
      managerScore: true,
      managerDetail: true,
    },
  });
  const resultBySub = new Map(results.map((r) => [String(r.peEvaluationSub), r]));
  const exportRows = round.heads.flatMap((h) =>
    h.subs.flatMap((s) => {
      const rs = resultBySub.get(String(s.id));
      const criteria = parseGradeCriteria(s.gradeCriteria);
      const lines =
        criteria.length > 0
          ? criteria
          : [
              {
                detailTopic: "",
                grade: null,
                minScore: Number(s.minScore),
                maxScore: Number(s.maxScore),
              },
            ];
      return lines.map((line, idx) => ({
        headTopic: h.headTopic,
        proportion: Number(h.proportion),
        subTopic: s.subTopic,
        minScore: line.minScore,
        maxScore: line.maxScore,
        grade: line.grade,
        criteriaDetail: line.detailTopic,
        selfScore: rs?.selfScore != null ? Number(rs.selfScore) : null,
        selfDetail: rs?.selfDetail ?? null,
        managerScore: rs?.managerScore != null ? Number(rs.managerScore) : null,
        managerDetail: rs?.managerDetail ?? null,
        subKey: String(s.id),
        isFirstOfSub: idx === 0,
      }));
    }),
  );
  const completedSubCount = round.heads
    .flatMap((h) => h.subs)
    .filter((s) => {
      const rs = resultBySub.get(String(s.id));
      return rs?.managerScore != null;
    }).length;
  const totalSubs = round.heads.reduce((n, h) => n + h.subs.length, 0);
  if (completedSubCount !== totalSubs) {
    return fail("ข้อมูลผลประเมินยังไม่ครบทุกหัวข้อ จึง export ไม่ได้");
  }

  const buffer = await buildEvaluationExportWorkbook({
    templateName: round.roundName ?? `Round ${templateId}`,
    employeeCode,
    employeeName: employeeDisplayName(employee),
    managerName: manager ? employeeDisplayName(manager) : managerCode,
    evaluationYear: round.evaluationYear,
    evaluationPeriod: round.evaluationPeriod,
    rows: exportRows,
  });

  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `EVA_${employeeCode}_${templateId}_${ymd}.xlsx`;
  return ok({
    fileName,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    base64: buffer.toString("base64"),
  });
}
