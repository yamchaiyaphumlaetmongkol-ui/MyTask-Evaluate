import { queryEssTemplateSearch } from "@/api/ess/esspets01/_queries";
import { ErpAlert } from "@/components/erp";
import { Esspets01TemplateTable } from "@/components/ess/tables/Esspets01TemplateTable";
import { hasRoundListFilter } from "@/lib/round-list-filter";
import type { RoundListFilter } from "@/lib/round-list-filter";

type Props = {
  filter: RoundListFilter;
};

export async function Esspets01TableSection({ filter }: Props) {
  try {
    const rows = await queryEssTemplateSearch(filter);
    const hasFilter = hasRoundListFilter(filter);
    const totalCount = hasFilter
      ? (await queryEssTemplateSearch()).length
      : undefined;

    return (
      <Esspets01TemplateTable
        rows={rows}
        hasFilter={hasFilter}
        totalCount={totalCount}
      />
    );
  } catch (e) {
    console.error("Esspets01TableSection", e);
    return <ErpAlert>ไม่สามารถโหลดรายการแบบประเมินได้</ErpAlert>;
  }
}
