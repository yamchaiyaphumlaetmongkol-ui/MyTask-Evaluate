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

/** วันที่ปัจจุบัน (YYYY-MM-DD) ตามเวลาเครื่องผู้ใช้ */
export function localDateOnlyString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ถึงวันเริ่มรอบแล้วหรือยัง — ไม่มีวันเริ่มถือว่าเปิดได้ */
export function isOnOrAfterRoundStartDate(
  startDate: string | null | undefined,
  today = localDateOnlyString(),
): boolean {
  const start = startDate?.trim();
  if (!start) return true;
  return today >= start;
}

/** เลยวันสิ้นสุดรอบแล้ว (วันสิ้นสุดยังนับว่าอยู่ในรอบ) */
export function isPastRoundEndDate(
  endDate: string | null | undefined,
  today = localDateOnlyString(),
): boolean {
  const end = endDate?.trim();
  if (!end) return false;
  return today > end;
}

export function normalizeRoundStatus(status: string): EvaluationRoundStatus {
  if (status === "draft" || status === "open" || status === "closed") {
    return status;
  }
  return "open";
}

/** สถานะที่แสดง — หมดเวลาแล้วถือว่าปิดรอบ */
export function effectiveRoundStatus(
  status: string,
  endDate: string | null | undefined,
  today = localDateOnlyString(),
): EvaluationRoundStatus {
  if (isPastRoundEndDate(endDate, today)) return "closed";
  return normalizeRoundStatus(status);
}

const STATUS_CYCLE: EvaluationRoundStatus[] = ["draft", "open", "closed"];

/** สลับสถานะ: draft → open → closed → draft */
export function nextRoundStatus(
  current: EvaluationRoundStatus,
): EvaluationRoundStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

export function roundStatusButtonClass(status: EvaluationRoundStatus): string {
  switch (status) {
    case "draft":
      return "btn-outline-secondary";
    case "open":
      return "btn-outline-success";
    case "closed":
      return "btn-outline-danger";
    default:
      return "btn-outline-secondary";
  }
}
