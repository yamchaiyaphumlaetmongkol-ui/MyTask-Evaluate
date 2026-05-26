import { employeeDisplayName } from "@/lib/employee-display";
import { parseGradeCriteria } from "@/lib/grade-criteria";
import { buildRoundSearchWhere } from "@/lib/round-search";
import type { TemplateSearchFilter } from "@/lib/template-search";
import { prisma } from "@/lib/prisma";
import type {
  EvalStep,
  SelfEvalSession,
  TemplateOption,
} from "@/api/ess/esspets02/types";

export { queryEmployeeOptions } from "@/api/_shared/employee-options";
export type { EmployeeOption } from "@/api/_shared/employee-options";

export async function queryTemplateOptions(
  filter: TemplateSearchFilter = {},
): Promise<TemplateOption[]> {
  const rows = await prisma.peEvaluationRound.findMany({
    where: {
      ...buildRoundSearchWhere(filter),
      status: { in: ["open", "draft"] },
    },
    orderBy: { id: "asc" },
    select: { id: true, roundName: true },
  });
  return rows.map((t) => ({
    id: String(t.id),
    name: t.roundName ?? `รอบ ${t.id}`,
  }));
}

export async function queryTemplateOptionById(
  templateId: string,
): Promise<TemplateOption | null> {
  const row = await prisma.peEvaluationRound.findUnique({
    where: { id: BigInt(templateId) },
    select: { id: true, roundName: true, active: true, status: true },
  });
  if (!row?.active || row.status === "closed") return null;
  return { id: String(row.id), name: row.roundName ?? `รอบ ${row.id}` };
}

function buildSteps(
  template: {
    heads: Array<{
      headTopic: string;
      proportion: unknown;
      subs: Array<{
        id: bigint;
        subTopic: string;
        minScore: unknown;
        maxScore: unknown;
        gradeCriteria: unknown;
      }>;
    }>;
  },
  employeeCode: string,
  results: Array<{
    peEvaluationSub: bigint;
    selfScore: unknown;
    selfDetail: string | null;
  }>,
): EvalStep[] {
  const resultBySub = new Map(
    results.map((r) => [String(r.peEvaluationSub), r]),
  );
  const steps: EvalStep[] = [];
  for (const head of template.heads) {
    for (const sub of head.subs) {
      const saved = resultBySub.get(String(sub.id));
      steps.push({
        subId: String(sub.id),
        headTopic: head.headTopic,
        subTopic: sub.subTopic,
        headProportion: Number(head.proportion),
        minScore: Number(sub.minScore),
        maxScore: Number(sub.maxScore),
        gradeCriteria: parseGradeCriteria(sub.gradeCriteria),
        savedScore: saved?.selfScore != null ? Number(saved.selfScore) : null,
        savedDetail: saved?.selfDetail ?? null,
      });
    }
  }
  return steps;
}

export async function querySelfEvalSession(
  templateId: string,
  employeeCode: string,
): Promise<SelfEvalSession | null> {
  const [template, employee] = await Promise.all([
    prisma.peEvaluationRound.findUnique({
      where: { id: BigInt(templateId) },
      include: {
        heads: {
          where: { active: true },
          orderBy: { id: "asc" },
          include: {
            subs: {
              where: { active: true },
              orderBy: { id: "asc" },
            },
          },
        },
      },
    }),
    prisma.pmEmployee.findUnique({ where: { employeeCode } }),
  ]);

  if (
    !template?.active ||
    template.status === "closed" ||
    !employee?.active ||
    !employee.employeeCode
  ) {
    return null;
  }

  const subIds = template.heads.flatMap((h) => h.subs.map((s) => s.id));
  const existingResults =
    subIds.length > 0
      ? await prisma.peEvaluationResult.findMany({
          where: {
            peEvaluationSub: { in: subIds },
            employeeCode,
          },
          select: {
            peEvaluationSub: true,
            selfScore: true,
            selfDetail: true,
          },
        })
      : [];

  const pos = employee.positionCode
    ? await prisma.pmPosition.findUnique({
        where: { positionCode: employee.positionCode },
        select: { positionName: true },
      })
    : null;

  return {
    templateId: String(template.id),
    templateName: template.roundName ?? "",
    employeeCode: employee.employeeCode,
    employeeName: employeeDisplayName(employee),
    positionName: pos?.positionName ?? null,
    steps: buildSteps(template, employeeCode, existingResults),
  };
}
