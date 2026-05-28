import { formatEvaluationPeriod } from "@/lib/evaluation-period";

/** ตัดปีออกจากชื่อรอบก่อนบันทึก (เก็บปีใน evaluationYear) */
export function stripYearFromRoundName(
  name: string,
  evaluationYear: number,
): string {
  let base = name.trim();
  if (!base) return base;

  const yearStr = String(evaluationYear);
  const patterns = [
    new RegExp(`\\s*\\(\\s*${yearStr}\\s*\\)\\s*$`),
    new RegExp(`\\s*ปี\\s*${yearStr}\\s*$`, "i"),
    new RegExp(`\\s+${yearStr}\\s*$`),
  ];
  for (const re of patterns) {
    base = base.replace(re, "").trim();
  }
  return base;
}

/** ชื่อรอบสำหรับบันทึก — ไม่รวมปี */
export function normalizeRoundNameForSave(
  name: string,
  evaluationYear: number,
): string {
  return stripYearFromRoundName(name, evaluationYear);
}

/** ชื่อที่แสดงใน UI — ชื่อฐาน + ปี (+ ช่วงถ้ามี) */
export function formatRoundDisplayName(
  roundName: string | null | undefined,
  evaluationYear: number,
  evaluationPeriod?: string | null,
): string {
  const base =
    roundName?.trim() ||
    `แบบประเมิน`;
  const periodLabel = formatEvaluationPeriod(evaluationPeriod ?? null);
  if (periodLabel) {
    return `${base} (${evaluationYear} · ${periodLabel})`;
  }
  return `${base} (${evaluationYear})`;
}
