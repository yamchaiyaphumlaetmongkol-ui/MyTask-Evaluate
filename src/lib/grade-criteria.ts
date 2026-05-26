/** เกณฑ์เกรดต่อหัวข้อย่อย — เก็บใน pe_evaluation_sub.grade_criteria (JSONB) */

export type GradeCriterion = {
  detailTopic: string;
  grade: string | null;
  minScore: number;
  maxScore: number;
};

export function parseGradeCriteria(json: unknown): GradeCriterion[] {
  if (!Array.isArray(json)) return [];
  return json
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const o = row as Record<string, unknown>;
      const detailTopic =
        typeof o.detailTopic === "string" ? o.detailTopic : "";
      const grade =
        typeof o.grade === "string" ? o.grade : o.grade == null ? null : "";
      const minScore = Number(o.minScore);
      const maxScore = Number(o.maxScore);
      if (!detailTopic.trim()) return null;
      if (Number.isNaN(minScore) || Number.isNaN(maxScore)) return null;
      return {
        detailTopic: detailTopic.trim(),
        grade: grade?.trim() || null,
        minScore,
        maxScore,
      };
    })
    .filter((r): r is GradeCriterion => r !== null);
}

export function gradeCriteriaToJson(
  rows: Array<{
    detailTopic: string;
    grade?: string;
    minScore: number;
    maxScore: number;
  }>,
): GradeCriterion[] {
  return rows.map((d) => ({
    detailTopic: d.detailTopic.trim(),
    grade: d.grade?.trim() || null,
    minScore: d.minScore,
    maxScore: d.maxScore,
  }));
}

export function scoreRangeFromCriteria(
  rows: GradeCriterion[],
): { minScore: number; maxScore: number } {
  if (rows.length === 0) return { minScore: 0, maxScore: 0 };
  return {
    minScore: Math.min(...rows.map((r) => r.minScore)),
    maxScore: Math.max(...rows.map((r) => r.maxScore)),
  };
}
