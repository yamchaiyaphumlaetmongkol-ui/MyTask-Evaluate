"use client";

import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { Esspets01TableBlock } from "@/components/ess/esspets01/Esspets01TableBlock";
import { RoundListSearchShell } from "@/components/shared/RoundListSearchShell";

const PAGE_KEY = "/ess/esspets01";

type Props = {
  filterOptions: RoundListFilterOptions;
};

export function Esspets01PageClient({ filterOptions }: Props) {
  return (
    <RoundListSearchShell
      pageKey={PAGE_KEY}
      idPrefix="esspets01"
      filterOptions={filterOptions}
      showMaster={false}
    >
      {(filter, isPending, refreshSignal) => (
        <Esspets01TableBlock
          filter={filter}
          loading={isPending}
          refreshSignal={refreshSignal}
        />
      )}
    </RoundListSearchShell>
  );
}
