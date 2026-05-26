/** สร้าง query string จาก object ตัวกรอง (ข้ามค่าว่าง) */
export function buildFilterQuery(
  params: Record<string, string | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = value?.trim();
    if (v) sp.set(key, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
