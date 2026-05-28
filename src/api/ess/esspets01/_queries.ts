/**
 * ESSPETS01 — อ่าน DB ฝั่ง server (ไม่มี "use server")
 */
import { queryTemplateList } from "@/api/_shared/template-list";
import type { EssTemplateSearchRow } from "@/api/ess/esspets01/types";
import {
  SELF_RESULT_WHERE,
  selfEvalListStatus,
  type SelfEvalProgress,
} from "@/lib/self-eval-completion";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { prisma } from "@/lib/prisma";

async function loadSelfEvalProgressByRound(
  employeeCode: string,
  roundIds: string[],
): Promise<Map<string, SelfEvalProgress>> {
  const map = new Map<string, SelfEvalProgress>();
  if (roundIds.length === 0) return map;

  const rounds = await prisma.peEvaluationRound.findMany({
    where: { id: { in: roundIds.map((id) => BigInt(id)) }, active: true },
    select: {
      id: true,
      heads: {
        where: { active: true },
        select: {
          subs: { where: { active: true }, select: { id: true } },
        },
      },
    },
  });

  const subToRound = new Map<string, string>();
  const allSubIds: bigint[] = [];
  for (const round of rounds) {
    const roundId = String(round.id);
    for (const head of round.heads) {
      for (const sub of head.subs) {
        subToRound.set(String(sub.id), roundId);
        allSubIds.push(sub.id);
      }
    }
    map.set(roundId, { totalSubs: 0, completedSubs: 0 });
  }

  for (const round of rounds) {
    const roundId = String(round.id);
    const total = round.heads.reduce((n, h) => n + h.subs.length, 0);
    map.set(roundId, { totalSubs: total, completedSubs: 0 });
  }

  if (allSubIds.length === 0) return map;

  const results = await prisma.peEvaluationResult.findMany({
    where: {
      employeeCode,
      peEvaluationSub: { in: allSubIds },
      ...SELF_RESULT_WHERE,
    },
    select: { peEvaluationSub: true },
  });

  const completedByRound = new Map<string, Set<string>>();
  for (const r of results) {
    const roundId = subToRound.get(String(r.peEvaluationSub));
    if (!roundId) continue;
    let set = completedByRound.get(roundId);
    if (!set) {
      set = new Set();
      completedByRound.set(roundId, set);
    }
    set.add(String(r.peEvaluationSub));
  }

  for (const [roundId, progress] of map) {
    progress.completedSubs = completedByRound.get(roundId)?.size ?? 0;
  }

  return map;
}

export async function queryEssTemplateSearch(
  filter: RoundListFilter = {},
  employeeCode?: string,
): Promise<EssTemplateSearchRow[]> {
  const rows = await queryTemplateList(filter);
  if (!employeeCode?.trim()) {
    return rows.map((r) => ({
      id: r.id,
      templateName: r.templateName,
      evaluationYear: r.evaluationYear,
      evaluationPeriod: r.evaluationPeriod,
      headCount: r.headCount,
      startDate: r.startDate,
      endDate: r.endDate,
      createdAt: r.createdAt,
      selfEvalStatus: null,
      selfEvalStatusLabel: null,
    }));
  }

  const progressMap = await loadSelfEvalProgressByRound(
    employeeCode.trim(),
    rows.map((r) => r.id),
  );

  return rows.map((r) => {
    const progress = progressMap.get(r.id) ?? {
      totalSubs: 0,
      completedSubs: 0,
    };
    const status = selfEvalListStatus(progress);
    return {
      id: r.id,
      templateName: r.templateName,
      evaluationYear: r.evaluationYear,
      evaluationPeriod: r.evaluationPeriod,
      headCount: r.headCount,
      startDate: r.startDate,
      endDate: r.endDate,
      createdAt: r.createdAt,
      selfEvalStatus: status,
      selfEvalStatusLabel:
        status === "complete"
          ? "ประเมินตนเองครบแล้ว"
          : "ยังประเมินตนเองไม่เสร็จ",
    };
  });
}
