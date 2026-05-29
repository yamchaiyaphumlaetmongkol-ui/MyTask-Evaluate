import { closeExpiredEvaluationRounds } from "@/api/pe/pems01/close_expired_rounds";
import { queryEvaluationTemplates } from "@/api/pe/pems01/_queries";
import type { EvaluationTemplateRow } from "@/api/pe/pems01/types";
import { ErpAlert } from "@/components/erp";
import { Pems01TemplateTable } from "@/components/pe/tables/Pems01TemplateTable";
import { hasRoundListFilter } from "@/lib/round-list-filter";
import type { RoundListFilter } from "@/lib/round-list-filter";

type Props = {
  filter: RoundListFilter;
};

type TablePayload = {
  rows: EvaluationTemplateRow[];
  hasFilter: boolean;
  totalCount?: number;
};

async function loadPems01Table(
  filter: RoundListFilter,
): Promise<TablePayload | null> {
  await closeExpiredEvaluationRounds();
  const rows = await queryEvaluationTemplates(filter);
  const hasFilter = hasRoundListFilter(filter);
  const totalCount = hasFilter
    ? (await queryEvaluationTemplates()).length
    : undefined;
  return { rows, hasFilter, totalCount };
}

export async function Pems01TableSection({ filter }: Props) {
  let payload: TablePayload | null = null;

  try {
    payload = await loadPems01Table(filter);
  } catch (e) {
    console.error("Pems01TableSection", e);
  }

  if (!payload) {
    return <ErpAlert>ไม่สามารถโหลดรายการรอบประเมินได้</ErpAlert>;
  }

  return (
    <Pems01TemplateTable
      rows={payload.rows}
      hasFilter={payload.hasFilter}
      totalCount={payload.totalCount}
    />
  );
}
