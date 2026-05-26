"use client";

import type { ManagerEvalFilterOptions } from "@/api/ess/esspets04/types";
import {
  ErpAlert,
  ErpField,
  ErpPageIntro,
  ErpSearchActions,
  ErpSearchActionsRow,
  ErpSearchFilterCol,
  ErpSearchFilterRows,
  ErpSearchPanel,
  ErpFilterSelect,
} from "@/components/erp";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { EVALUATION_PERIODS } from "@/lib/evaluation-period";
import { MANAGER_EVAL_DOCUMENT_STATUSES } from "@/lib/manager-eval-document-status";
import { managerEvalFilterSearchKey } from "@/lib/filter-search-key";
import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import { useCurrentUserStore } from "@/store/currentUserStore";

type Props = {
  filter: ManagerEvalQueueFilter;
  options: ManagerEvalFilterOptions;
  managerCode: string;
  onSearch?: (params: Record<string, string>) => void;
  onClear?: () => void;
};

export function Esspets04SearchForm({
  filter,
  options,
  managerCode,
  onSearch,
  onClear,
}: Props) {
  const hydrated = useStoreHydrated();
  const sidebarCode = useCurrentUserStore((s) => s.employeeCode);
  const sidebarName = useCurrentUserStore((s) => s.employeeName);
  const effectiveManager = managerCode || (hydrated ? sidebarCode ?? "" : "");

  const clearHref =
    onClear || !effectiveManager
      ? undefined
      : `/ess/esspets04?managerCode=${encodeURIComponent(effectiveManager)}`;

  const periodOptions = EVALUATION_PERIODS.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  const documentStatusOptions = MANAGER_EVAL_DOCUMENT_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <ErpSearchPanel
      action="/ess/esspets04"
      onSearch={onSearch}
    >
      <input type="hidden" name="managerCode" value={effectiveManager} />

      {!effectiveManager && hydrated && (
        <ErpAlert variant="warning" className="mb-3">
          กรุณาเลือกผู้ใช้งานก่อนค้นหา
        </ErpAlert>
      )}

      {effectiveManager && (
        <ErpPageIntro className="mb-3">
          ผู้ประเมิน:{" "}
          <span className="fw-semibold text-dark">
            {sidebarName || effectiveManager}
          </span>
        </ErpPageIntro>
      )}

      <ErpSearchFilterRows key={managerEvalFilterSearchKey(effectiveManager, filter)}>
        <ErpSearchFilterCol>
          <ErpField label="พนักงาน" htmlFor="esspets04-employeeCode">
            <ErpFilterSelect
              id="esspets04-employeeCode"
              name="employeeCode"
              options={options.employees}
              defaultValue={filter.employeeCode ?? ""}
              searchPlaceholder="ค้นหาพนักงาน..."
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="สถานะเอกสาร" htmlFor="esspets04-documentStatus">
            <ErpFilterSelect
              id="esspets04-documentStatus"
              name="documentStatus"
              options={documentStatusOptions}
              defaultValue={filter.documentStatus ?? ""}
              searchable={false}
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="ชื่อแบบประเมิน" htmlFor="esspets04-roundId">
            <ErpFilterSelect
              id="esspets04-roundId"
              name="roundId"
              options={options.rounds}
              defaultValue={filter.roundId ?? ""}
              searchPlaceholder="ค้นหาแบบประเมิน..."
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="ปีประเมิน" htmlFor="esspets04-evaluationYear">
            <ErpFilterSelect
              id="esspets04-evaluationYear"
              name="evaluationYear"
              options={options.years}
              defaultValue={filter.evaluationYear ?? ""}
              searchable={false}
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="ช่วงประเมิน" htmlFor="esspets04-evaluationPeriod">
            <ErpFilterSelect
              id="esspets04-evaluationPeriod"
              name="evaluationPeriod"
              options={periodOptions}
              defaultValue={filter.evaluationPeriod ?? ""}
              searchable={false}
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="วันเริ่ม (จาก)" htmlFor="esspets04-dateFrom">
            <input
              id="esspets04-dateFrom"
              type="date"
              name="dateFrom"
              className="form-control"
              defaultValue={filter.dateFrom ?? ""}
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="วันสิ้นสุด (ถึง)" htmlFor="esspets04-dateTo">
            <input
              id="esspets04-dateTo"
              type="date"
              name="dateTo"
              className="form-control"
              defaultValue={filter.dateTo ?? ""}
            />
          </ErpField>
        </ErpSearchFilterCol>
      </ErpSearchFilterRows>

      <ErpSearchActionsRow>
        <ErpSearchActions
          clearHref={clearHref}
          onClear={onClear}
          submitDisabled={!effectiveManager}
        />
      </ErpSearchActionsRow>
    </ErpSearchPanel>
  );
}
