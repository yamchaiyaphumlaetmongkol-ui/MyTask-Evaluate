import type { Prisma } from "@prisma/client";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { parseDateOnly } from "@/lib/template-search";

/** where สำหรับค้นหารอบประเมิน (ESS / PEMS01) */
export function buildRoundSearchWhere(
  filter: RoundListFilter,
): Prisma.PeEvaluationRoundWhereInput {
  const from = parseDateOnly(filter.dateFrom);
  const to = parseDateOnly(filter.dateTo);

  const where: Prisma.PeEvaluationRoundWhereInput = { active: true };

  if (filter.roundId?.trim()) {
    where.id = BigInt(filter.roundId.trim());
  }

  const nameQ = filter.roundNameQ?.trim();
  if (nameQ) {
    where.OR = [
      { roundName: { contains: nameQ, mode: "insensitive" } },
      {
        master: {
          masterName: { contains: nameQ, mode: "insensitive" },
        },
      },
    ];
  }

  if (filter.masterId?.trim()) {
    where.masterId = BigInt(filter.masterId.trim());
  }

  if (filter.evaluationPeriod?.trim()) {
    where.evaluationPeriod = filter.evaluationPeriod.trim();
  }

  if (filter.evaluationYear?.trim()) {
    const year = Number(filter.evaluationYear);
    if (!Number.isNaN(year)) {
      where.evaluationYear = year;
    }
  }

  if (filter.status?.trim()) {
    where.status = filter.status.trim();
  }

  const and: Prisma.PeEvaluationRoundWhereInput[] = [];

  if (to) {
    and.push({
      OR: [{ startDate: null }, { startDate: { lte: to } }],
    });
  }

  if (from) {
    and.push({
      OR: [{ endDate: null }, { endDate: { gte: from } }],
    });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}
