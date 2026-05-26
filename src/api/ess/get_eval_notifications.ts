"use server";

import {
  queryPendingEvalAlerts,
  type PendingEvalAlert,
} from "@/api/ess/_shared/pending-eval-alerts";

export async function getEvalNotifications(
  managerCode: string,
): Promise<PendingEvalAlert[]> {
  const code = managerCode.trim();
  if (!code) return [];
  return queryPendingEvalAlerts(code);
}
