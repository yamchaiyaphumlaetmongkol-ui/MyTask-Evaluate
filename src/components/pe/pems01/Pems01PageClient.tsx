"use client";

import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { Pems01TableBlock } from "@/components/pe/pems01/Pems01TableBlock";
import { RoundListSearchShell } from "@/components/shared/RoundListSearchShell";

const PAGE_KEY = "/pe/pems01";

type Props = {
  filterOptions: RoundListFilterOptions;
};

export function Pems01PageClient({ filterOptions }: Props) {
  return (
    <RoundListSearchShell
      pageKey={PAGE_KEY}
      idPrefix="pems01"
      filterOptions={filterOptions}
      showStatus
    >
      {(filter, isPending, refreshSignal) => (
        <Pems01TableBlock
          filter={filter}
          loading={isPending}
          refreshSignal={refreshSignal}
        />
      )}
    </RoundListSearchShell>
  );
}
