/** ช่วยตรวจ/แปลงฟิลด์ผลประเมิน (ใช้ร่วมกัน ESS) */

export type EvaluationResultFields = {
  selfScore?: unknown;
  selfDetail?: string | null;
  managerScore?: unknown;
  managerDetail?: string | null;
};

export function hasSelfResult(r: EvaluationResultFields): boolean {
  return (
    r.selfScore != null || (r.selfDetail?.trim() ?? "") !== ""
  );
}

export function hasManagerResult(r: EvaluationResultFields): boolean {
  return (
    r.managerScore != null || (r.managerDetail?.trim() ?? "") !== ""
  );
}

export function toScoreNumber(value: unknown): number | null {
  return value != null ? Number(value) : null;
}
