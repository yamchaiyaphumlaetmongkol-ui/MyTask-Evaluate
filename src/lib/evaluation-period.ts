export const EVALUATION_PERIODS = [
  { value: "H1", label: "ครึ่งแรก" },
  { value: "H2", label: "ครึ่งหลัง" },
] as const;

export type EvaluationPeriodCode = (typeof EVALUATION_PERIODS)[number]["value"];

export function formatEvaluationPeriod(
  code: string | null | undefined,
): string {
  if (!code) return "—";
  return EVALUATION_PERIODS.find((p) => p.value === code)?.label ?? code;
}
