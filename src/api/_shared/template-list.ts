import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatRoundLabel } from "@/lib/evaluation-round";
import { buildRoundSearchWhere } from "@/lib/round-search";
import {
  toDateOnlyString,
  type TemplateSearchFilter,
} from "@/lib/template-search";
import { prisma } from "@/lib/prisma";

/** แถวรายการรอบประเมิน (ESS / PEMS01) — templateId ใน URL = roundId */
export type TemplateListRow = {
  id: string;
  templateName: string;
  masterId: string;
  masterName: string;
  evaluationYear: number;
  evaluationPeriod: string | null;
  status: string;
  headCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export async function queryTemplateList(
  filter: TemplateSearchFilter = {},
): Promise<TemplateListRow[]> {
  const rounds = await prisma.peEvaluationRound.findMany({
    where: buildRoundSearchWhere(filter),
    orderBy: [{ evaluationYear: "desc" }, { id: "desc" }],
    include: {
      master: { select: { id: true, masterName: true } },
      _count: { select: { heads: { where: { active: true } } } },
    },
  });

  return rounds.map((r) => {
    const periodLabel = formatEvaluationPeriod(r.evaluationPeriod);
    const displayName =
      r.roundName?.trim() ||
      formatRoundLabel(r.master.masterName, r.evaluationYear, r.evaluationPeriod, periodLabel);

    return {
      id: String(r.id),
      templateName: displayName,
      masterId: String(r.master.id),
      masterName: r.master.masterName,
      evaluationYear: r.evaluationYear,
      evaluationPeriod: r.evaluationPeriod,
      status: r.status,
      headCount: r._count.heads,
      startDate: toDateOnlyString(r.startDate),
      endDate: toDateOnlyString(r.endDate),
      createdAt: r.createdDate.toISOString(),
    };
  });
}
