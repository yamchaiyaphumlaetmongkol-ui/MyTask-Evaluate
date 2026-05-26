"use client";

import type { ManagerEvalFilterOptions } from "@/api/ess/esspets04/types";
import { Esspets04SearchForm } from "@/components/ess/Esspets04SearchForm";
import { Esspets04TableBlock } from "@/components/ess/esspets04/Esspets04TableBlock";
import { ErpTableSkeleton } from "@/components/erp";
import { useStoredManagerEvalFilter } from "@/hooks/useStoredManagerEvalFilter";
import { parseManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";

type Props = {
  managerCode: string;
  filterOptions: ManagerEvalFilterOptions;
};

export function Esspets04ListClient({ managerCode, filterOptions }: Props) {
  const { filter, applyFilter, clearFilter, ready, isPending } =
    useStoredManagerEvalFilter(managerCode);

  if (!ready) {
    return <ErpTableSkeleton columns={8} />;
  }

  return (
    <>
      <Esspets04SearchForm
        filter={filter}
        options={filterOptions}
        managerCode={managerCode}
        onSearch={(params) =>
          applyFilter(
            parseManagerEvalQueueFilter(params, { applyDefaults: false }),
          )
        }
        onClear={clearFilter}
      />
      <Esspets04TableBlock
        managerCode={managerCode}
        filter={filter}
        loading={isPending}
      />
    </>
  );
}
