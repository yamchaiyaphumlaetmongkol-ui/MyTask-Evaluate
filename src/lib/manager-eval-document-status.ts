/** สถานะเอกสารการประเมินฝั่งผู้จัดการ (ESSPETS04) */

/** ค่าเริ่มต้นตัวกรอง ESSPETS04 */
export const DEFAULT_MANAGER_EVAL_DOCUMENT_STATUS = "pending" as const;

export const MANAGER_EVAL_DOCUMENT_STATUSES = [
  { value: "pending", label: "รอประเมิน" },
  { value: "completed", label: "ประเมินแล้ว" },
  { value: "incomplete", label: "ประเมินแล้วแต่ยังไม่เสร็จ" },
] as const;

export type ManagerEvalDocumentStatus =
  (typeof MANAGER_EVAL_DOCUMENT_STATUSES)[number]["value"];

const LABEL_BY_VALUE = Object.fromEntries(
  MANAGER_EVAL_DOCUMENT_STATUSES.map((s) => [s.value, s.label]),
) as Record<ManagerEvalDocumentStatus, string>;

export function formatManagerEvalDocumentStatus(
  status: ManagerEvalDocumentStatus,
): string {
  return LABEL_BY_VALUE[status] ?? status;
}

/** คำนวณจากจำนวนหัวข้อย่อยทั้งหมด vs ที่ผู้ประเมินกรอกแล้ว */
export function resolveManagerEvalDocumentStatus(
  totalSubs: number,
  managerFilledCount: number,
): ManagerEvalDocumentStatus {
  if (totalSubs <= 0 || managerFilledCount <= 0) return "pending";
  if (managerFilledCount >= totalSubs) return "completed";
  return "incomplete";
}

export function isManagerEvalDocumentStatus(
  value: string | undefined,
): value is ManagerEvalDocumentStatus {
  return (
    value === "pending" ||
    value === "completed" ||
    value === "incomplete"
  );
}
