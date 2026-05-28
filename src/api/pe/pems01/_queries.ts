/**
 * โหลดข้อมูลฝั่ง server — ไม่มี "use server"
 */
import { loadPermissionsFor } from "@/api/pe/pems01/_permission";
import { queryTemplateList } from "@/api/_shared/template-list";
import { parseGradeCriteria } from "@/lib/grade-criteria";
import { toDateOnlyString } from "@/lib/template-search";
import {
  emptyTopicPermission,
  newClientKey,
  type EvaluationDetailDraft,
  type EvaluationHeadDraft,
  type EvaluationSubDraft,
  type EvaluationTemplateFormState,
  type EvaluationTemplateRow,
  type MasterBlueprintFormState,
  type MasterBlueprintRow,
  type PeMasters,
  type TopicPermissionSelection,
} from "@/api/pe/pems01/types";
import { prisma } from "@/lib/prisma";

export type TemplateSearchParams = {
  q?: string;
  dateFrom?: string;
  dateTo?: string;
};

/** รายการแบบประเมิน (หน้า /pe/pems01) */
export async function queryEvaluationTemplates(
  filter: TemplateSearchParams = {},
): Promise<EvaluationTemplateRow[]> {
  const rows = await queryTemplateList(filter);
  return rows.map((r) => ({
    id: r.id,
    templateName: r.templateName,
    masterId: r.masterId,
    masterName: r.masterName,
    evaluationYear: r.evaluationYear,
    evaluationPeriod: r.evaluationPeriod,
    status: r.status,
    headCount: r.headCount,
    startDate: r.startDate,
    endDate: r.endDate,
    createdAt: r.createdAt,
  }));
}

export async function queryPeMasters(): Promise<PeMasters> {
  const [roles, positions] = await Promise.all([
    prisma.pmRole.findMany({
      where: { active: true },
      orderBy: { roleCode: "asc" },
      select: { roleCode: true, roleName: true },
    }),
    prisma.pmPosition.findMany({
      where: { active: true },
      orderBy: { positionCode: "asc" },
      select: { positionCode: true, positionName: true },
    }),
  ]);
  return {
    roles: roles.map((r) => ({ code: r.roleCode, name: r.roleName })),
    positions: positions.map((p) => ({
      code: p.positionCode,
      name: p.positionName,
    })),
  };
}

async function headToDraft(head: {
  id: bigint;
  headTopic: string;
  proportion: unknown;
  subs: Array<{
    id: bigint;
    subTopic: string;
    gradeCriteria: unknown;
  }>;
}): Promise<EvaluationHeadDraft> {
  const permissions = await loadPermissionsFor("head", head.id);
  const num = (v: unknown) => Number(v);

  return {
    clientKey: newClientKey(),
    id: String(head.id),
    headTopic: head.headTopic,
    proportion: num(head.proportion),
    permissions,
    subs: head.subs.map(
      (s): EvaluationSubDraft => {
        const criteria = parseGradeCriteria(s.gradeCriteria);
        return {
          clientKey: newClientKey(),
          id: String(s.id),
          subTopic: s.subTopic,
          details:
            criteria.length > 0
              ? criteria.map(
                  (c): EvaluationDetailDraft => ({
                    clientKey: newClientKey(),
                    detailTopic: c.detailTopic,
                    minScore: c.minScore,
                    maxScore: c.maxScore,
                    grade: c.grade ?? "",
                  }),
                )
              : [],
        };
      },
    ),
  };
}

/** โหลดแบบประเมิน + HEAD/SUB + เกณฑ์เกรด สำหรับ /pe/pems01/form */
export async function queryTemplateFormInitial(
  templateId?: string,
): Promise<EvaluationTemplateFormState> {
  if (!templateId) {
    return {
      templateName: "",
      evaluationYear: new Date().getFullYear(),
      evaluationPeriod: "H1",
      startDate: "",
      endDate: "",
      permissions: emptyTopicPermission(),
      heads: [],
    };
  }

  const round = await prisma.peEvaluationRound.findUnique({
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

  if (!round?.active) {
    return {
      templateName: "",
      evaluationYear: new Date().getFullYear(),
      evaluationPeriod: "H1",
      startDate: "",
      endDate: "",
      permissions: emptyTopicPermission(),
      heads: [],
    };
  }

  const heads = await Promise.all(round.heads.map((h) => headToDraft(h)));
  const permissions: TopicPermissionSelection =
    heads[0]?.permissions ?? emptyTopicPermission();

  return {
    templateId: String(round.id),
    templateName: round.roundName ?? "",
    evaluationYear: round.evaluationYear,
    evaluationPeriod: round.evaluationPeriod ?? "H1",
    startDate: toDateOnlyString(round.startDate) ?? "",
    endDate: toDateOnlyString(round.endDate) ?? "",
    permissions,
    heads,
  };
}

/** รายการแม่แบบ (/pe/pems01/masters) */
export async function queryMasterBlueprintList(): Promise<MasterBlueprintRow[]> {
  const rows = await prisma.peEvaluationTemplateMaster.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
    include: {
      _count: { select: { blueprintHeads: { where: { active: true } } } },
    },
  });
  return rows.map((m) => ({
    id: String(m.id),
    masterName: m.masterName,
    headCount: m._count.blueprintHeads,
    createdAt: m.createdDate.toISOString(),
  }));
}

/** โหลดแม่แบบ + HEAD/SUB สำหรับ /pe/pems01/master/form */
export async function queryMasterFormInitial(
  masterId?: string,
): Promise<MasterBlueprintFormState> {
  if (!masterId) {
    return {
      masterName: "",
      description: "",
      permissions: emptyTopicPermission(),
      heads: [],
    };
  }

  const master = await prisma.peEvaluationTemplateMaster.findUnique({
    where: { id: BigInt(masterId) },
    include: {
      blueprintHeads: {
        where: { active: true },
        orderBy: { id: "asc" },
        include: {
          subs: { where: { active: true }, orderBy: { id: "asc" } },
        },
      },
    },
  });

  if (!master?.active) {
    return {
      masterName: "",
      description: "",
      permissions: emptyTopicPermission(),
      heads: [],
    };
  }

  const heads = await Promise.all(
    master.blueprintHeads.map((h) => headToDraft(h)),
  );
  const permissions: TopicPermissionSelection =
    heads[0]?.permissions ?? emptyTopicPermission();

  return {
    masterId: String(master.id),
    masterName: master.masterName,
    description: master.description ?? "",
    permissions,
    heads,
  };
}
