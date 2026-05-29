"use server";

import { closeExpiredEvaluationRounds } from "@/api/pe/pems01/close_expired_rounds";
import { queryEvaluationTemplates } from "@/api/pe/pems01/_queries";
import type { EvaluationTemplateRow } from "@/api/pe/pems01/types";
import {
  hasRoundListFilter,
  type RoundListFilter,
} from "@/lib/round-list-filter";

export type Pems01TablePayload = {
  rows: EvaluationTemplateRow[];
  hasFilter: boolean;
  totalCount?: number;
};

export async function fetchPems01Table(
  filter: RoundListFilter,
): Promise<Pems01TablePayload> {
  await closeExpiredEvaluationRounds();
  const rows = await queryEvaluationTemplates(filter);
  const hasFilter = hasRoundListFilter(filter);
  const totalCount = hasFilter
    ? (await queryEvaluationTemplates()).length
    : undefined;
  return { rows, hasFilter, totalCount };
}
