"use client";

import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { ErpTableSkeleton } from "@/components/erp";
import { RoundListSearchForm } from "@/components/shared/RoundListSearchForm";
import { useStoredRoundListFilter } from "@/hooks/useStoredRoundListFilter";
import { parseRoundListSearchParams } from "@/lib/parse-round-list-search-params";
import { roundListFilterSearchKey } from "@/lib/filter-search-key";
import type { RoundListFilter } from "@/lib/round-list-filter";
import type { ReactNode } from "react";

type Props = {
  pageKey: string;
  idPrefix: string;
  filterOptions: RoundListFilterOptions;
  showStatus?: boolean;
  showMaster?: boolean;
  submitDisabled?: boolean;
  children: (
    filter: RoundListFilter,
    isPending: boolean,
    refreshSignal: RoundListFilterOptions,
  ) => ReactNode;
};

/** ฟอร์มค้นหา + ตาราง — ตัวกรองไม่ขึ้น URL */
export function RoundListSearchShell({
  pageKey,
  idPrefix,
  filterOptions,
  showStatus,
  showMaster,
  submitDisabled,
  children,
}: Props) {
  const { filter, applyFilter, clearFilter, ready, isPending } =
    useStoredRoundListFilter(pageKey);

  if (!ready) {
    return <ErpTableSkeleton columns={8} />;
  }

  return (
    <>
      <RoundListSearchForm
        key={roundListFilterSearchKey(filter)}
        idPrefix={idPrefix}
        filter={filter}
        options={filterOptions}
        showStatus={showStatus}
        showMaster={showMaster}
        submitDisabled={submitDisabled}
        onSearch={(params) =>
          applyFilter(parseRoundListSearchParams(params))
        }
        onClear={clearFilter}
      />
      {children(filter, isPending, filterOptions)}
    </>
  );
}
