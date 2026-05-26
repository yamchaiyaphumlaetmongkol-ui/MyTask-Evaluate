import type { Prisma } from "@prisma/client";
import { buildRoundSearchWhere } from "@/lib/round-search";

import {
  hasRoundListFilter,
  type RoundListFilter,
} from "@/lib/round-list-filter";

/** @deprecated ใช้ RoundListFilter */
export type TemplateSearchFilter = RoundListFilter & {
  /** @deprecated ใช้ roundId */
  q?: string;
};

export function parseDateOnly(value?: string): Date | null {
  const v = value?.trim();
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function hasTemplateSearchFilter(filter: TemplateSearchFilter): boolean {
  const { q, ...rest } = filter;
  return Boolean(q?.trim()) || hasRoundListFilter(rest);
}

export { hasRoundListFilter };

/** @deprecated ใช้ buildRoundSearchWhere — templateId ใน UI = roundId */
export function buildTemplateSearchWhere(
  filter: TemplateSearchFilter,
): Prisma.PeEvaluationRoundWhereInput {
  return buildRoundSearchWhere(filter);
}

export function toDateOnlyString(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}
