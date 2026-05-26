"use client";

import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { ErpAlert, ErpPageIntro } from "@/components/erp";
import { RoundListSearchForm } from "@/components/shared/RoundListSearchForm";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { useCurrentUserStore } from "@/store/currentUserStore";

type Props = {
  filter: RoundListFilter;
  options: RoundListFilterOptions;
  viewerCode: string;
};

export function Esspets03SearchForm({ filter, options, viewerCode }: Props) {
  const hydrated = useStoreHydrated();
  const sidebarCode = useCurrentUserStore((s) => s.employeeCode);
  const sidebarName = useCurrentUserStore((s) => s.employeeName);
  const effectiveViewer = viewerCode || (hydrated ? sidebarCode ?? "" : "");

  return (
    <>
      {!effectiveViewer && hydrated && (
        <ErpAlert variant="warning" className="mb-3">
          กรุณาเลือกผู้ใช้งานก่อนค้นหา
        </ErpAlert>
      )}

      {effectiveViewer && (
        <ErpPageIntro className="mb-3">
          ติดตามสถานะในนาม:{" "}
          <span className="fw-semibold text-dark">
            {sidebarName || effectiveViewer}
          </span>
        </ErpPageIntro>
      )}

      <RoundListSearchForm
        action="/ess/esspets03"
        idPrefix="esspets03"
        filter={filter}
        options={options}
        extraParams={{ viewerCode: effectiveViewer }}
        showMaster={false}
        submitDisabled={!effectiveViewer}
      />
    </>
  );
}
