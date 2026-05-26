import { evaluationYearOptions } from "@/lib/round-list-filter";
import { prisma } from "@/lib/prisma";

export type RoundFilterOption = { value: string; label: string };

export type RoundListFilterOptions = {
  rounds: RoundFilterOption[];
  masters: RoundFilterOption[];
  years: RoundFilterOption[];
};

/** ตัวเลือก dropdown สำหรับฟอร์มค้นหารอบประเมิน */
export async function queryRoundListFilterOptions(): Promise<RoundListFilterOptions> {
  const [roundRows, masterRows, yearRows] = await Promise.all([
    prisma.peEvaluationRound.findMany({
      where: { active: true },
      orderBy: [{ evaluationYear: "desc" }, { id: "desc" }],
      select: {
        id: true,
        roundName: true,
        evaluationYear: true,
        evaluationPeriod: true,
        master: { select: { masterName: true } },
      },
    }),
    prisma.peEvaluationTemplateMaster.findMany({
      where: { active: true },
      orderBy: { masterName: "asc" },
      select: { id: true, masterName: true },
    }),
    prisma.peEvaluationRound.findMany({
      where: { active: true },
      distinct: ["evaluationYear"],
      select: { evaluationYear: true },
      orderBy: { evaluationYear: "desc" },
    }),
  ]);

  const rounds: RoundFilterOption[] = roundRows.map((r) => ({
    value: String(r.id),
    label:
      r.roundName?.trim() ||
      `${r.master.masterName} ${r.evaluationYear} ${r.evaluationPeriod ?? ""}`.trim(),
  }));

  const masters: RoundFilterOption[] = masterRows.map((m) => ({
    value: String(m.id),
    label: m.masterName,
  }));

  const years = evaluationYearOptions(
    yearRows.map((y) => y.evaluationYear),
  );

  return { rounds, masters, years };
}
