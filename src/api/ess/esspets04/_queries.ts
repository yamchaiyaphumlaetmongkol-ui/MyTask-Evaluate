import { loadPermissionsForMany } from "@/api/pe/pems01/_permission";
import { employeeDisplayName } from "@/lib/employee-display";
import { templateHasEvaluateAccess } from "@/lib/evaluation-permission";
import { hasManagerResult, hasSelfResult } from "@/lib/evaluation-result";
import { resolveManagerEvalDocumentStatus } from "@/lib/manager-eval-document-status";
import { parseGradeCriteria } from "@/lib/grade-criteria";
import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import { matchesManagerEvalQueueRow } from "@/lib/manager-eval-queue-filter";
import { formatRoundDisplayName } from "@/lib/round-name";
import { buildRoundSearchWhere } from "@/lib/round-search";
import { toDateOnlyString } from "@/lib/template-search";
import { prisma } from "@/lib/prisma";
import type { EvalStep } from "@/api/ess/esspets02/types";
import type {
  ManagerEvalQueueRow,
  ManagerEvalSession,
} from "@/api/ess/esspets04/types";

export { queryEmployeeOptions as queryManagerOptions } from "@/api/_shared/employee-options";
export type { EmployeeOption as ManagerOption } from "@/api/_shared/employee-options";

type RoundMeta = {
  id: bigint;
  roundName: string | null;
  startDate: Date | null;
  endDate: Date | null;
  evaluationPeriod: string | null;
  evaluationYear: number;
  createdDate: Date;
  heads: Array<{
    id: bigint;
    subs: Array<{ id: bigint }>;
  }>;
};

/** รายการพนักงาน × แบบประเมิน ที่ manager มีสิทธิ์ประเมิน และพนักงานประเมินตนเองแล้ว */
export async function queryManagerEvalQueueList(
  managerCode: string,
  filter: ManagerEvalQueueFilter = {},
): Promise<ManagerEvalQueueRow[]> {
  const manager = await prisma.pmEmployee.findUnique({
    where: { employeeCode: managerCode },
  });
  if (!manager?.active || !manager.employeeCode) return [];

  const managerAccess = {
    roleCode: manager.roleCode,
    positionCode: manager.positionCode,
  };

  const rounds = await prisma.peEvaluationRound.findMany({
    where: {
      ...buildRoundSearchWhere(filter),
      status: { in: ["open", "draft"] },
    },
    orderBy: { id: "asc" },
    include: {
      heads: {
        where: { active: true },
        select: {
          id: true,
          subs: { where: { active: true }, select: { id: true } },
        },
      },
    },
  });

  const headIds = rounds.flatMap((t) => t.heads.map((h) => h.id));
  const headPermMap = await loadPermissionsForMany("head", headIds);

  const allowedRounds = rounds.filter((t) => {
    const headPerms = t.heads.map((h) => headPermMap.get(String(h.id))!);
    return templateHasEvaluateAccess(headPerms, managerAccess);
  }) as RoundMeta[];

  const allowedRoundIds = allowedRounds.map((t) => t.id);
  if (allowedRoundIds.length === 0) return [];

  const roundById = new Map(allowedRounds.map((t) => [String(t.id), t]));

  const results = await prisma.peEvaluationResult.findMany({
    where: {
      sub: {
        active: true,
        head: {
          active: true,
          peEvaluationRound: { in: allowedRoundIds },
        },
      },
      employee: { active: true, employeeCode: { not: null } },
    },
    include: {
      employee: true,
      sub: {
        include: {
          head: { select: { peEvaluationRound: true } },
        },
      },
    },
  });

  type PairAcc = {
    employeeCode: string;
    employeeName: string;
    templateId: string;
    hasSelf: boolean;
    managerFilledSubIds: Set<string>;
  };

  const pairs = new Map<string, PairAcc>();

  for (const r of results) {
    const templateId = String(r.sub.head.peEvaluationRound);
    if (!roundById.has(templateId)) continue;

    const key = `${r.employeeCode}|${templateId}`;
    let acc = pairs.get(key);
    if (!acc) {
      acc = {
        employeeCode: r.employeeCode,
        employeeName: employeeDisplayName(r.employee),
        templateId,
        hasSelf: false,
        managerFilledSubIds: new Set(),
      };
      pairs.set(key, acc);
    }
    if (hasSelfResult(r)) acc.hasSelf = true;
    if (hasManagerResult(r)) {
      acc.managerFilledSubIds.add(String(r.peEvaluationSub));
    }
  }

  const rows: ManagerEvalQueueRow[] = [];

  for (const acc of pairs.values()) {
    if (!acc.hasSelf) continue;

    const round = roundById.get(acc.templateId)!;
    const roundLabel = formatRoundDisplayName(
      round.roundName ?? `รอบ ${acc.templateId}`,
      round.evaluationYear,
      round.evaluationPeriod,
    );
    const totalSubs = round.heads.reduce((n, h) => n + h.subs.length, 0);
    const documentStatus = resolveManagerEvalDocumentStatus(
      totalSubs,
      acc.managerFilledSubIds.size,
    );
    const row: ManagerEvalQueueRow = {
      employeeCode: acc.employeeCode,
      employeeName: acc.employeeName,
      templateId: acc.templateId,
      templateName: roundLabel,
      evaluationPeriod: round.evaluationPeriod,
      evaluationYear: round.evaluationYear,
      startDate: toDateOnlyString(round.startDate),
      endDate: toDateOnlyString(round.endDate),
      createdAt: round.createdDate.toISOString(),
      canEvaluate: true,
      documentStatus,
    };
    if (!matchesManagerEvalQueueRow(row, filter)) continue;
    rows.push(row);
  }

  return rows.sort((a, b) => {
    const byEmp = a.employeeName.localeCompare(b.employeeName, "th");
    if (byEmp !== 0) return byEmp;
    return a.templateName.localeCompare(b.templateName, "th");
  });
}

export async function queryManagerEvalSession(
  templateId: string,
  employeeCode: string,
  managerCode: string,
): Promise<ManagerEvalSession | null> {
  const [template, employee, manager] = await Promise.all([
    prisma.peEvaluationRound.findUnique({
      where: { id: BigInt(templateId) },
      include: {
        heads: {
          where: { active: true },
          orderBy: { id: "asc" },
          include: {
            subs: { where: { active: true }, orderBy: { id: "asc" } },
          },
        },
      },
    }),
    prisma.pmEmployee.findUnique({ where: { employeeCode } }),
    prisma.pmEmployee.findUnique({ where: { employeeCode: managerCode } }),
  ]);

  if (
    !template?.active ||
    !employee?.active ||
    !employee.employeeCode ||
    !manager?.active ||
    !manager.employeeCode
  ) {
    return null;
  }

  const headPermMap = await loadPermissionsForMany(
    "head",
    template.heads.map((h) => h.id),
  );
  const headPerms = template.heads.map((h) => headPermMap.get(String(h.id))!);
  if (
    !templateHasEvaluateAccess(headPerms, {
      roleCode: manager.roleCode,
      positionCode: manager.positionCode,
    })
  ) {
    return null;
  }

  const subIds = template.heads.flatMap((h) => h.subs.map((s) => s.id));
  if (subIds.length === 0) return null;

  const selfDone = await prisma.peEvaluationResult.count({
    where: {
      employeeCode,
      peEvaluationSub: { in: subIds },
      OR: [{ selfScore: { not: null } }, { selfDetail: { not: null } }],
    },
  });
  if (selfDone === 0) return null;

  const existingResults =
    subIds.length > 0
      ? await prisma.peEvaluationResult.findMany({
          where: {
            peEvaluationSub: { in: subIds },
            employeeCode,
          },
          select: {
            peEvaluationSub: true,
            managerScore: true,
            managerDetail: true,
          },
        })
      : [];

  const resultBySub = new Map(
    existingResults.map((r) => [String(r.peEvaluationSub), r]),
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
        savedScore:
          saved?.managerScore != null ? Number(saved.managerScore) : null,
        savedDetail: saved?.managerDetail ?? null,
      });
    }
  }

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
    managerCode: manager.employeeCode,
    managerName: employeeDisplayName(manager),
    positionName: pos?.positionName ?? null,
    steps,
  };
}
