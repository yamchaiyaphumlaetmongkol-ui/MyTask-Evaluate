/** เงื่อนไข Prisma — มีผลประเมินตนเองบันทึกแล้ว */
export const SELF_RESULT_WHERE = {
  OR: [{ selfScore: { not: null } }, { selfDetail: { not: null } }],
};

export type SelfEvalProgress = {
  totalSubs: number;
  completedSubs: number;
};

export type SelfEvalListStatus = "complete" | "incomplete" | "not_started";

export function selfEvalListStatus(
  progress: SelfEvalProgress,
): SelfEvalListStatus {
  if (progress.totalSubs === 0) return "not_started";
  if (progress.completedSubs >= progress.totalSubs) return "complete";
  if (progress.completedSubs > 0) return "incomplete";
  return "not_started";
}

export function selfEvalStatusLabel(status: SelfEvalListStatus): string {
  switch (status) {
    case "complete":
      return "ประเมินตนเองครบแล้ว";
    case "incomplete":
      return "ยังประเมินตนเองไม่เสร็จ";
    default:
      return "ยังไม่เริ่มประเมินตนเอง";
  }
}
