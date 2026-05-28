import { parseDateOnly } from "@/lib/template-search";

/** ตัวกรองรายการรอบประเมิน — สอดคล้องคอลัมน์ตาราง */
export type RoundListFilter = {
  /** @deprecated ใช้ roundNameQ — ค้นหาด้วยข้อความ */
  roundId?: string;
  /** ค้นหาชื่อรอบ / แบบประเมิน (contains) */
  roundNameQ?: string;
  masterId?: string;
  evaluationPeriod?: string;
  evaluationYear?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function hasRoundListFilter(filter: RoundListFilter): boolean {
  return Boolean(
    filter.roundId?.trim() ||
      filter.roundNameQ?.trim() ||
      filter.masterId?.trim() ||
      filter.evaluationPeriod?.trim() ||
      filter.evaluationYear?.trim() ||
      filter.status?.trim() ||
      filter.dateFrom?.trim() ||
      filter.dateTo?.trim(),
  );
}

export function evaluationYearOptions(
  yearsFromDb: number[],
  selected?: string,
): { value: string; label: string }[] {
  const current = new Date().getFullYear();
  const set = new Set<number>([current, current - 1, current + 1, ...yearsFromDb]);
  const sorted = [...set].sort((a, b) => b - a);
  const options = sorted.map((y) => ({
    value: String(y),
    label: String(y),
  }));
  if (selected && !options.some((o) => o.value === selected)) {
    options.unshift({ value: selected, label: selected });
  }
  return options;
}

export function matchesRoundDateRange(
  startDate: string | null,
  endDate: string | null,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  const from = parseDateOnly(dateFrom);
  const to = parseDateOnly(dateTo);
  if (to) {
    const start = startDate ? parseDateOnly(startDate) : null;
    if (start && start > to) return false;
  }
  if (from) {
    const end = endDate ? parseDateOnly(endDate) : null;
    if (end && end < from) return false;
  }
  return true;
}
