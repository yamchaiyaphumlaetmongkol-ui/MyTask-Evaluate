import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import type { RoundListFilter } from "@/lib/round-list-filter";

const ROUND_KEYS = [
  "roundId",
  "roundNameQ",
  "masterId",
  "evaluationPeriod",
  "evaluationYear",
  "status",
  "dateFrom",
  "dateTo",
] as const;

/** คีย์สำหรับ Suspense — เปลี่ยนเมื่อตัวกรองเปลี่ยน */
export function roundListFilterSearchKey(
  filter: RoundListFilter,
  extra?: Record<string, string | undefined>,
): string {
  const parts: string[] = [];
  for (const key of ROUND_KEYS) {
    const value = filter[key]?.trim();
    if (value) parts.push(`${key}=${encodeURIComponent(value)}`);
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      const trimmed = value?.trim();
      if (trimmed) parts.push(`${key}=${encodeURIComponent(trimmed)}`);
    }
  }
  return parts.join("&") || "_";
}

export function managerEvalFilterSearchKey(
  managerCode: string,
  filter: ManagerEvalQueueFilter,
): string {
  const base = roundListFilterSearchKey(filter, {
    managerCode: managerCode.trim(),
  });
  const emp = filter.employeeCode?.trim();
  const parts = emp ? [`${base}&employeeCode=${encodeURIComponent(emp)}`] : [base];
  const doc = filter.documentStatus?.trim();
  if (doc) parts.push(`documentStatus=${encodeURIComponent(doc)}`);
  return parts.join("&");
}
