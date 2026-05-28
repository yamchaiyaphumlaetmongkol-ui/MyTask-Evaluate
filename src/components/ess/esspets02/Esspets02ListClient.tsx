"use client";

import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { Esspets02TemplatesBlock } from "@/components/ess/esspets02/Esspets02TemplatesBlock";
import { RoundListSearchShell } from "@/components/shared/RoundListSearchShell";

const PAGE_KEY = "/ess/esspets02";

type Props = {
  filterOptions: RoundListFilterOptions;
  templateId: string;
  employeeCode: string;
};

export function Esspets02ListClient({
  filterOptions,
  templateId,
  employeeCode,
}: Props) {
  return (
    <RoundListSearchShell
      pageKey={PAGE_KEY}
      idPrefix="esspets02"
      filterOptions={filterOptions}
      showMaster={false}
    >
      {(filter, isPending, refreshSignal) => (
        <Esspets02TemplatesBlock
          filter={filter}
          loading={isPending}
          refreshSignal={refreshSignal}
          templateId={templateId}
          employeeCode={employeeCode}
        />
      )}
    </RoundListSearchShell>
  );
}
