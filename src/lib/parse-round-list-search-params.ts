import type { RoundListFilter } from "@/lib/round-list-filter";

type SearchParams = Record<string, string | undefined>;

/** อ่าน query string → RoundListFilter (รองรับ q เก่า = roundId ไม่ใช้แล้ว) */
export function parseRoundListSearchParams(
  params: SearchParams,
): RoundListFilter {
  return {
    roundId: (params.roundId ?? params.q ?? "").trim() || undefined,
    roundNameQ: params.roundNameQ?.trim() || undefined,
    masterId: params.masterId?.trim() || undefined,
    evaluationPeriod: params.evaluationPeriod?.trim() || undefined,
    evaluationYear: params.evaluationYear?.trim() || undefined,
    status: params.status?.trim() || undefined,
    dateFrom: params.dateFrom?.trim() || undefined,
    dateTo: params.dateTo?.trim() || undefined,
  };
}
