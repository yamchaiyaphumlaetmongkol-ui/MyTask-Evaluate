/** กรองแถวตารางฝั่ง client — ไม่ block main thread บน list ใหญ่มาก */
export function filterBySearch<T>(
  rows: T[],
  query: string,
  pickText: (row: T) => string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => pickText(row).toLowerCase().includes(q));
}

/** กรองเมื่อเลือกค่าใน dropdown (ค่าว่าง = ทั้งหมด) */
export function filterBySelectValue<T>(
  rows: T[],
  value: string,
  pickValue: (row: T) => string,
): T[] {
  const v = value.trim();
  if (!v) return rows;
  return rows.filter((row) => pickValue(row) === v);
}

export function uniqueSelectOptions(
  values: Array<string | null | undefined>,
): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const raw of values) {
    const v = raw?.trim();
    if (!v) continue;
    map.set(v, v);
  }
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "th"));
}
