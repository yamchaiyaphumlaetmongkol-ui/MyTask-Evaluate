"use server";

import { queryEssTemplateSearch } from "@/api/ess/esspets01/_queries";
import type { EssTemplateSearchRow } from "@/api/ess/esspets01/types";
import {
  hasRoundListFilter,
  type RoundListFilter,
} from "@/lib/round-list-filter";

export type Esspets01TablePayload = {
  rows: EssTemplateSearchRow[];
  hasFilter: boolean;
  totalCount?: number;
};

export async function fetchEsspets01Table(
  filter: RoundListFilter,
): Promise<Esspets01TablePayload> {
  const rows = await queryEssTemplateSearch(filter);
  const hasFilter = hasRoundListFilter(filter);
  const totalCount = hasFilter
    ? (await queryEssTemplateSearch()).length
    : undefined;
  return { rows, hasFilter, totalCount };
}
