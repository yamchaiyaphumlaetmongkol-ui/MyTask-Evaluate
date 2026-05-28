import type {
  EvaluationStatusHeadBlock,
  EvaluationStatusSubRow,
  EvaluationStatusTemplateDetail,
  EvaluationStatusTemplateRow,
} from "@/api/ess/esspets03/types";
import { loadPermissionsForMany } from "@/api/pe/pems01/_permission";
import type { TopicPermissionSelection } from "@/api/pe/pems01/types";
import { employeeDisplayName } from "@/lib/employee-display";
import {
  canViewOwnEvaluationStatus,
  templateHasEditAccess,
} from "@/lib/evaluation-permission";
import {
  hasManagerResult,
  toScoreNumber,
  type EvaluationResultFields,
} from "@/lib/evaluation-result";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { SELF_RESULT_WHERE } from "@/lib/self-eval-completion";
import { buildRoundSearchWhere } from "@/lib/round-search";
import { toDateOnlyString } from "@/lib/template-search";
import { prisma } from "@/lib/prisma";

type ViewerContext = {
  employeeCode: string;
  roleCode: string | null;
  positionCode: string | null;
};

async function loadViewer(
  viewerCode: string,
): Promise<ViewerContext | null> {
  const viewer = await prisma.pmEmployee.findUnique({
    where: { employeeCode: viewerCode },
  });
  if (!viewer?.active || !viewer.employeeCode) return null;
  return {
    employeeCode: viewer.employeeCode,
    roleCode: viewer.roleCode,
    positionCode: viewer.positionCode,
  };
}

function mapSubRow(
  sub: { id: bigint; subTopic: string },
  result?: EvaluationResultFields | null,
): EvaluationStatusSubRow {
  return {
    subId: String(sub.id),
    subTopic: sub.subTopic,
    selfScore: toScoreNumber(result?.selfScore),
    selfDetail: result?.selfDetail?.trim() || null,
    managerScore: toScoreNumber(result?.managerScore),
    managerDetail: result?.managerDetail?.trim() || null,
  };
}

type RoundWithHeads = {
  id: bigint;
  roundName: string | null;
  startDate: Date | null;
  endDate: Date | null;
  evaluationPeriod: string | null;
  heads: Array<{ id: bigint; subs: Array<{ id: bigint }> }>;
};

function roundSearchWhere(filter?: RoundListFilter) {
  return buildRoundSearchWhere(filter ?? {});
}

const templateListInclude = {
  heads: {
    where: { active: true },
    include: {
      subs: { where: { active: true }, select: { id: true } },
    },
  },
} as const;

type ManagerResultRow = EvaluationResultFields & {
  managerEmployeeCode: string | null;
  managerEmployee: {
    employeeCode: string | null;
    titleName: string | null;
    firstName: string;
    lastName: string;
    clickupUsername: string | null;
  } | null;
};

function resolveEvaluatedBy(
  results: ManagerResultRow[],
): { evaluatedByCode: string | null; evaluatedByName: string | null } {
  const tallies = new Map<string, { count: number; name: string }>();

  for (const row of results) {
    const code = row.managerEmployeeCode?.trim();
    if (!code || !hasManagerResult(row)) continue;
    const name = row.managerEmployee
      ? employeeDisplayName(row.managerEmployee)
      : code;
    const prev = tallies.get(code);
    tallies.set(code, { count: (prev?.count ?? 0) + 1, name });
  }

  if (tallies.size === 0) {
    return { evaluatedByCode: null, evaluatedByName: null };
  }

  const [bestCode, best] = [...tallies.entries()].sort(
    (a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0], "th"),
  )[0]!;

  return { evaluatedByCode: bestCode, evaluatedByName: best.name };
}

function mapTemplateRows(rounds: RoundWithHeads[]): EvaluationStatusTemplateRow[] {
  return rounds.map((t) => ({
    id: String(t.id),
    templateName: t.roundName ?? `รอบ ${t.id}`,
    startDate: toDateOnlyString(t.startDate),
    endDate: toDateOnlyString(t.endDate),
    evaluationPeriod: t.evaluationPeriod,
    headCount: t.heads.length,
    subCount: t.heads.reduce((n, h) => n + h.subs.length, 0),
  }));
}

/** แบบประเมินที่พนักงานเคยบันทึกประเมินตนเองอย่างน้อย 1 หัวข้อ */
async function queryTemplatesWithAnySelfResult(
  employeeCode: string,
  filter?: RoundListFilter,
): Promise<RoundWithHeads[]> {
  return prisma.peEvaluationRound.findMany({
    where: {
      ...roundSearchWhere(filter),
      heads: {
        some: {
          active: true,
          subs: {
            some: {
              active: true,
              results: {
                some: { employeeCode, ...SELF_RESULT_WHERE },
              },
            },
          },
        },
      },
    },
    orderBy: { id: "asc" },
    include: templateListInclude,
  });
}

/** แบบที่ส่งประเมินตนเองแล้ว — ครบทุกหัวข้อย่อยที่เปิดใช้งาน */
async function queryTemplatesWithSubmittedSelfEval(
  employeeCode: string,
  filter?: RoundListFilter,
): Promise<RoundWithHeads[]> {
  const candidates = await queryTemplatesWithAnySelfResult(employeeCode, filter);
  if (candidates.length === 0) return [];

  const subIds = candidates.flatMap((t) =>
    t.heads.flatMap((h) => h.subs.map((s) => s.id)),
  );
  if (subIds.length === 0) return [];

  const selfResults = await prisma.peEvaluationResult.findMany({
    where: {
      employeeCode,
      peEvaluationSub: { in: subIds },
      ...SELF_RESULT_WHERE,
    },
    select: { peEvaluationSub: true },
  });

  const selfSubIds = new Set(
    selfResults.map((r) => String(r.peEvaluationSub)),
  );

  return candidates.filter((round) => {
    const subs = round.heads.flatMap((h) => h.subs);
    return subs.length > 0 && subs.every((s) => selfSubIds.has(String(s.id)));
  });
}

/** รายการแบบประเมิน — เฉพาะที่พนักงานส่งประเมินตนเองครบแล้ว */
export async function queryEvaluationStatusTemplateList(
  viewerCode: string,
  filter?: RoundListFilter,
): Promise<EvaluationStatusTemplateRow[]> {
  const viewer = await loadViewer(viewerCode);
  if (!viewer) return [];

  const submitted = await queryTemplatesWithSubmittedSelfEval(
    viewer.employeeCode,
    filter,
  );

  return mapTemplateRows(submitted);
}

/** ผลประเมินทั้งแบบ — เจ้าของแบบประเมิน หรือดูสถานะของตนเอง */
export async function queryEvaluationStatusTemplateDetail(
  templateId: string,
  employeeCode: string,
  viewerCode: string,
): Promise<EvaluationStatusTemplateDetail | null> {
  const viewer = await loadViewer(viewerCode);
  if (!viewer) return null;

  const template = await prisma.peEvaluationRound.findUnique({
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
  });

  const employee = await prisma.pmEmployee.findUnique({
    where: { employeeCode },
  });

  if (!template?.active || !employee?.active || !employee.employeeCode) {
    return null;
  }

  const permMap = await loadPermissionsForMany(
    "head",
    template.heads.map((h) => h.id),
  );
  const headPerms = template.heads.map((h) => permMap.get(String(h.id))!);
  const hasEdit = templateHasEditAccess(headPerms, viewer);
  const viewingOwn = canViewOwnEvaluationStatus(
    viewer.employeeCode,
    employee.employeeCode,
  );
  if (!hasEdit && !viewingOwn) {
    return null;
  }

  const subIds = template.heads.flatMap((h) => h.subs.map((s) => s.id));
  const results =
    subIds.length > 0
      ? await prisma.peEvaluationResult.findMany({
          where: {
            employeeCode,
            peEvaluationSub: { in: subIds },
          },
          select: {
            peEvaluationSub: true,
            selfScore: true,
            selfDetail: true,
            managerScore: true,
            managerDetail: true,
            managerEmployeeCode: true,
            managerEmployee: {
              select: {
                employeeCode: true,
                titleName: true,
                firstName: true,
                lastName: true,
                clickupUsername: true,
              },
            },
          },
        })
      : [];

  const { evaluatedByCode, evaluatedByName } = resolveEvaluatedBy(results);

  const resultBySub = new Map(
    results.map((r) => [String(r.peEvaluationSub), r]),
  );

  const heads: EvaluationStatusHeadBlock[] = template.heads.map((head) => ({
    headId: String(head.id),
    headTopic: head.headTopic,
    subs: head.subs.map((sub) =>
      mapSubRow(sub, resultBySub.get(String(sub.id))),
    ),
  }));

  return {
    templateId: String(template.id),
    templateName: template.roundName ?? `รอบ ${template.id}`,
    startDate: toDateOnlyString(template.startDate),
    endDate: toDateOnlyString(template.endDate),
    evaluationPeriod: template.evaluationPeriod,
    employeeCode: employee.employeeCode,
    employeeName: employeeDisplayName(employee),
    evaluatedByCode,
    evaluatedByName,
    heads,
  };
}
