export const EVALUATION_ROUND_STATUSES = [
  { value: "draft", label: "ร่าง" },
  { value: "open", label: "เปิดประเมิน" },
  { value: "closed", label: "ปิดรอบ" },
] as const;

export type EvaluationRoundStatus =
  (typeof EVALUATION_ROUND_STATUSES)[number]["value"];

export function formatRoundStatus(code: string | null | undefined): string {
  if (!code) return "—";
  return (
    EVALUATION_ROUND_STATUSES.find((s) => s.value === code)?.label ?? code
  );
}

export function formatRoundLabel(
  masterName: string,
  year: number,
  period: string | null,
  periodLabel: string,
): string {
  const p = periodLabel || period || "";
  return `${masterName} ${year}${p ? ` · ${p}` : ""}`;
}

export function isRoundEditable(status: string): boolean {
  return status === "draft" || status === "open";
}

export function isRoundOpenForEval(status: string): boolean {
  return status === "open";
}
