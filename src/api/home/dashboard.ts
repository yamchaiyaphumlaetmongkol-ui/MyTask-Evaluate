import { formatRoundDisplayName } from "@/lib/round-name";
import { selfEvalListStatus } from "@/lib/self-eval-completion";
import { hasManagerResult } from "@/lib/evaluation-result";
import { prisma } from "@/lib/prisma";

export type HomeDashboardRound = {
  roundId: string;
  roundName: string;
  evaluationYear: number;
  evaluationPeriod: string | null;
  roundStatus: string;
  selfCompleted: number;
  selfTotal: number;
  selfStatus: "complete" | "incomplete" | "not_started";
  managerCompleted: number;
  managerTotal: number;
  hasManagerEval: boolean;
};

export type HomeDashboardSummary = {
  employeeCode: string;
  employeeName: string;
  totalRounds: number;
  selfCompleteCount: number;
  selfPendingCount: number;
  rounds: HomeDashboardRound[];
};

export async function queryHomeDashboard(
  employeeCode: string,
): Promise<HomeDashboardSummary | null> {
  const employee = await prisma.pmEmployee.findUnique({
    where: { employeeCode },
  });
  if (!employee?.active || !employee.employeeCode) return null;

  const rounds = await prisma.peEvaluationRound.findMany({
    where: { active: true, status: { in: ["open", "draft", "closed"] } },
    orderBy: [{ evaluationYear: "desc" }, { id: "desc" }],
    select: {
      id: true,
      roundName: true,
      evaluationYear: true,
      evaluationPeriod: true,
      status: true,
      master: { select: { masterName: true } },
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
  }

  const results =
    allSubIds.length === 0
      ? []
      : await prisma.peEvaluationResult.findMany({
          where: {
            employeeCode,
            peEvaluationSub: { in: allSubIds },
          },
          select: {
            peEvaluationSub: true,
            selfScore: true,
            selfDetail: true,
            managerScore: true,
            managerDetail: true,
          },
        });

  const selfDoneByRound = new Map<string, Set<string>>();
  const managerDoneByRound = new Map<string, Set<string>>();

  for (const r of results) {
    const roundId = subToRound.get(String(r.peEvaluationSub));
    if (!roundId) continue;

    const hasSelf =
      r.selfScore != null || (r.selfDetail?.trim() ?? "") !== "";
    if (hasSelf) {
      let set = selfDoneByRound.get(roundId);
      if (!set) {
        set = new Set();
        selfDoneByRound.set(roundId, set);
      }
      set.add(String(r.peEvaluationSub));
    }

    if (hasManagerResult(r)) {
      let set = managerDoneByRound.get(roundId);
      if (!set) {
        set = new Set();
        managerDoneByRound.set(roundId, set);
      }
      set.add(String(r.peEvaluationSub));
    }
  }

  const dashboardRounds: HomeDashboardRound[] = rounds.map((round) => {
    const roundId = String(round.id);
    const selfTotal = round.heads.reduce((n, h) => n + h.subs.length, 0);
    const selfCompleted = selfDoneByRound.get(roundId)?.size ?? 0;
    const managerCompleted = managerDoneByRound.get(roundId)?.size ?? 0;
    const selfStatus = selfEvalListStatus({
      totalSubs: selfTotal,
      completedSubs: selfCompleted,
    });

    return {
      roundId,
      roundName: formatRoundDisplayName(
        round.roundName?.trim() || round.master.masterName,
        round.evaluationYear,
        round.evaluationPeriod,
      ),
      evaluationYear: round.evaluationYear,
      evaluationPeriod: round.evaluationPeriod,
      roundStatus: round.status,
      selfCompleted,
      selfTotal,
      selfStatus,
      managerCompleted,
      managerTotal: selfTotal,
      hasManagerEval: managerCompleted > 0,
    };
  });

  const selfCompleteCount = dashboardRounds.filter(
    (r) => r.selfStatus === "complete",
  ).length;

  return {
    employeeCode: employee.employeeCode,
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    totalRounds: dashboardRounds.length,
    selfCompleteCount,
    selfPendingCount: dashboardRounds.length - selfCompleteCount,
    rounds: dashboardRounds,
  };
}
