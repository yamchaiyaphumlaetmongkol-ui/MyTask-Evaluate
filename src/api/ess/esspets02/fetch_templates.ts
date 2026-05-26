"use server";

import { queryTemplateOptions } from "@/api/ess/esspets02/_queries";
import type { TemplateOption } from "@/api/ess/esspets02/types";
import type { RoundListFilter } from "@/lib/round-list-filter";

export async function fetchEsspets02Templates(
  filter: RoundListFilter,
): Promise<TemplateOption[]> {
  return queryTemplateOptions(filter);
}
