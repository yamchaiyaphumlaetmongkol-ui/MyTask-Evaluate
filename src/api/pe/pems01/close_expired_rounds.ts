import { isPastRoundEndDate, localDateOnlyString } from "@/lib/evaluation-round";
import { prisma } from "@/lib/prisma";
import { toDateOnlyString } from "@/lib/template-search";

/** ปิดรอบที่เลยวันสิ้นสุดแล้วอัตโนมัติ */
export async function closeExpiredEvaluationRounds(): Promise<number> {
  const today = localDateOnlyString();
  const candidates = await prisma.peEvaluationRound.findMany({
    where: {
      active: true,
      status: { not: "closed" },
      endDate: { not: null },
    },
    select: { id: true, endDate: true },
  });

  const expiredIds = candidates
    .filter((round) => isPastRoundEndDate(toDateOnlyString(round.endDate), today))
    .map((round) => round.id);

  if (expiredIds.length === 0) return 0;

  const result = await prisma.peEvaluationRound.updateMany({
    where: { id: { in: expiredIds } },
    data: { status: "closed" },
  });

  return result.count;
}
