import { loadPermissionsForMany } from "@/api/pe/pems01/_permission";
import { employeeDisplayName } from "@/lib/employee-display";
import { canEvaluateEmployee } from "@/lib/evaluation-permission";
import { hasManagerResult, hasSelfResult } from "@/lib/evaluation-result";
import { prisma } from "@/lib/prisma";

export type PendingEvalAlert = {
  id: string;
  employeeCode: string;
  employeeName: string;
  templateId: string;
  templateName: string;
  selfCompletedCount: number;
  subTotalCount: number;
  href: string;
};

/** พนักงานประเมินตนเองแล้ว แต่ manager ยังไม่ครบ — ผู้ดูมีสิทธิ์ประเมิน */
export async function queryPendingEvalAlerts(
  managerCode: string,
): Promise<PendingEvalAlert[]> {
  const manager = await prisma.pmEmployee.findUnique({
    where: { employeeCode: managerCode },
  });
  if (!manager?.active || !manager.employeeCode) return [];

  const results = await prisma.peEvaluationResult.findMany({
    where: {
      OR: [{ selfScore: { not: null } }, { selfDetail: { not: null } }],
      employee: { active: true, employeeCode: { not: null } },
      sub: {
        active: true,
        head: { active: true, round: { active: true } },
      },
    },
    include: {
      employee: true,
      sub: {
        include: {
          head: { include: { round: true } },
        },
      },
    },
  });

  const headIds = [
    ...new Set(results.map((r) => r.sub.head.id)),
  ];
  const headPermMap = await loadPermissionsForMany("head", headIds);

  type GroupKey = string;
  const groups = new Map<
    GroupKey,
    {
      employeeCode: string;
      employeeName: string;
      templateId: string;
      templateName: string;
      selfSubs: Set<string>;
      mgrSubs: Set<string>;
    }
  >();

  const templateSubTotals = new Map<string, number>();

  for (const r of results) {
    const headId = r.sub.head.id;
    const perm = headPermMap.get(String(headId));
    if (
      !perm ||
      !canEvaluateEmployee(perm, {
        roleCode: manager.roleCode,
        positionCode: manager.positionCode,
      })
    ) {
      continue;
    }

    const templateId = String(r.sub.head.round.id);
    const gKey = `${r.employeeCode}|${templateId}`;
    let g = groups.get(gKey);
    if (!g) {
      g = {
        employeeCode: r.employeeCode,
        employeeName: employeeDisplayName(r.employee),
        templateId,
        templateName: r.sub.head.round.roundName ?? `รอบ ${templateId}`,
        selfSubs: new Set(),
        mgrSubs: new Set(),
      };
      groups.set(gKey, g);
    }
    const subKey = String(r.peEvaluationSub);
    if (hasSelfResult(r)) g.selfSubs.add(subKey);
    if (hasManagerResult(r)) g.mgrSubs.add(subKey);
  }

  for (const g of groups.values()) {
    if (!templateSubTotals.has(g.templateId)) {
      const count = await prisma.peEvaluationSub.count({
        where: {
          active: true,
          head: {
            active: true,
            peEvaluationRound: BigInt(g.templateId),
          },
        },
      });
      templateSubTotals.set(g.templateId, count);
    }
  }

  const alerts: PendingEvalAlert[] = [];

  for (const g of groups.values()) {
    const total = templateSubTotals.get(g.templateId) ?? 0;
    if (g.selfSubs.size === 0) continue;
    if (total > 0 && g.mgrSubs.size >= total) continue;

    alerts.push({
      id: `${g.employeeCode}|${g.templateId}`,
      employeeCode: g.employeeCode,
      employeeName: g.employeeName,
      templateId: g.templateId,
      templateName: g.templateName,
      selfCompletedCount: g.selfSubs.size,
      subTotalCount: total || g.selfSubs.size,
      href: `/ess/esspets04?managerCode=${encodeURIComponent(managerCode)}&templateId=${encodeURIComponent(g.templateId)}&employeeCode=${encodeURIComponent(g.employeeCode)}`,
    });
  }

  return alerts.sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName, "th"),
  );
}
