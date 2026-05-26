/** คีย์ query ที่เป็นตัวกรองตาราง (ไม่โชว์บน URL) */
export const ROUND_LIST_FILTER_PARAM_KEYS = [
  "roundId",
  "masterId",
  "evaluationPeriod",
  "evaluationYear",
  "status",
  "dateFrom",
  "dateTo",
  "q",
] as const;

/** ตัวกรองเพิ่มเติมของ ESSPETS04 (ไม่โชว์บน URL เมื่อใช้ storage) */
export const MANAGER_EVAL_FILTER_PARAM_KEYS = [
  ...ROUND_LIST_FILTER_PARAM_KEYS,
  "employeeCode",
  "documentStatus",
] as const;

const STORAGE_PREFIX = "erp-page-filter:";

function storageKey(pageKey: string): string {
  return `${STORAGE_PREFIX}${pageKey}`;
}

export function readPageFilter<T extends object>(pageKey: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(pageKey));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writePageFilter<T extends object>(
  pageKey: string,
  value: T,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(pageKey), JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function clearPageFilter(pageKey: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey(pageKey));
  } catch {
    /* ignore */
  }
}

/** ลบเฉพาะพารามิเตอร์ตัวกรองออกจาก URL คง context อื่นไว้ */
export function stripRoundListFilterParams(
  search: string,
): { cleaned: string; hadFilter: boolean } {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  let hadFilter = false;
  for (const key of ROUND_LIST_FILTER_PARAM_KEYS) {
    if (sp.has(key)) {
      hadFilter = true;
      sp.delete(key);
    }
  }
  const cleaned = sp.toString();
  return { cleaned, hadFilter };
}

/** ลบตัวกรอง ESSPETS04 — คง managerCode และลิงก์เปิดแบบประเมิน (templateId+employeeCode) */
export function stripManagerEvalFilterParams(
  search: string,
): { cleaned: string; hadFilter: boolean } {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const keepEvalKeys =
    sp.has("templateId") && sp.has("employeeCode") && sp.has("managerCode");
  let hadFilter = false;

  for (const key of MANAGER_EVAL_FILTER_PARAM_KEYS) {
    if (sp.has(key)) {
      hadFilter = true;
      if (!(keepEvalKeys && key === "employeeCode")) {
        sp.delete(key);
      }
    }
  }

  const cleaned = sp.toString();
  return { cleaned, hadFilter };
}
