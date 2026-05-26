import { queryEvaluationTemplates } from "@/api/pe/pems01/_queries";
import { ErpAlert } from "@/components/erp";
import { Pems01TemplateTable } from "@/components/pe/tables/Pems01TemplateTable";
import { hasRoundListFilter } from "@/lib/round-list-filter";
import type { RoundListFilter } from "@/lib/round-list-filter";

type Props = {
  filter: RoundListFilter;
};

export async function Pems01TableSection({ filter }: Props) {
  try {
    const rows = await queryEvaluationTemplates(filter);
    const hasFilter = hasRoundListFilter(filter);
    const totalCount = hasFilter
      ? (await queryEvaluationTemplates()).length
      : undefined;

    return (
      <Pems01TemplateTable
        rows={rows}
        hasFilter={hasFilter}
        totalCount={totalCount}
      />
    );
  } catch (e) {
    console.error("Pems01TableSection", e);
    return <ErpAlert>ไม่สามารถโหลดรายการรอบประเมินได้</ErpAlert>;
  }
}
