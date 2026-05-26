import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import {
  ErpField,
  ErpSearchActions,
  ErpSearchActionsRow,
  ErpSearchFilterCol,
  ErpSearchFilterRows,
  ErpSearchPanel,
  ErpFilterSelect,
} from "@/components/erp";
import { EVALUATION_PERIODS } from "@/lib/evaluation-period";
import { EVALUATION_ROUND_STATUSES } from "@/lib/evaluation-round";
import type { RoundListFilter } from "@/lib/round-list-filter";

type Props = {
  idPrefix: string;
  filter: RoundListFilter;
  options: RoundListFilterOptions;
  /** โหมด URL (legacy) — ไม่ใส่ถ้าใช้ onSearch/onClear */
  action?: string;
  extraParams?: Record<string, string>;
  showStatus?: boolean;
  showMaster?: boolean;
  submitDisabled?: boolean;
  onSearch?: (params: Record<string, string>) => void;
  onClear?: () => void;
};

function buildClearHref(
  action: string,
  extraParams?: Record<string, string>,
): string {
  if (!extraParams || Object.keys(extraParams).length === 0) return action;
  const params = new URLSearchParams(extraParams);
  return `${action}?${params.toString()}`;
}

/** ฟอร์มค้นหารอบ — กริด 6 คอลัมน์ + ปุ่มกึ่งกลางด้านล่าง */
export function RoundListSearchForm({
  action,
  idPrefix,
  filter,
  options,
  extraParams,
  showStatus = false,
  showMaster = true,
  submitDisabled = false,
  onSearch,
  onClear,
}: Props) {
  const clearHref =
    action && !onClear ? buildClearHref(action, extraParams) : undefined;

  const periodOptions = EVALUATION_PERIODS.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  const statusOptions = EVALUATION_ROUND_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <ErpSearchPanel
      action={action}
      className="mb-3"
      onSearch={onSearch}
    >
      {extraParams
        ? Object.entries(extraParams).map(([name, value]) =>
            value ? (
              <input key={name} type="hidden" name={name} value={value} />
            ) : null,
          )
        : null}

      <ErpSearchFilterRows>
        <ErpSearchFilterCol>
          <ErpField label="ชื่อรอบ / แบบประเมิน" htmlFor={`${idPrefix}-roundId`}>
            <ErpFilterSelect
              id={`${idPrefix}-roundId`}
              name="roundId"
              options={options.rounds}
              defaultValue={filter.roundId ?? ""}
              searchPlaceholder="ค้นหารอบ / แบบประเมิน..."
            />
          </ErpField>
        </ErpSearchFilterCol>

        {showMaster ? (
          <ErpSearchFilterCol>
            <ErpField label="แม่แบบ" htmlFor={`${idPrefix}-masterId`}>
              <ErpFilterSelect
                id={`${idPrefix}-masterId`}
                name="masterId"
                options={options.masters}
                defaultValue={filter.masterId ?? ""}
                searchPlaceholder="ค้นหาแม่แบบ..."
              />
            </ErpField>
          </ErpSearchFilterCol>
        ) : null}

        <ErpSearchFilterCol>
          <ErpField label="ปีประเมิน" htmlFor={`${idPrefix}-evaluationYear`}>
            <ErpFilterSelect
              id={`${idPrefix}-evaluationYear`}
              name="evaluationYear"
              options={options.years}
              defaultValue={filter.evaluationYear ?? ""}
              searchable={false}
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="ช่วงประเมิน" htmlFor={`${idPrefix}-evaluationPeriod`}>
            <ErpFilterSelect
              id={`${idPrefix}-evaluationPeriod`}
              name="evaluationPeriod"
              options={periodOptions}
              defaultValue={filter.evaluationPeriod ?? ""}
              searchable={false}
            />
          </ErpField>
        </ErpSearchFilterCol>

        {showStatus ? (
          <ErpSearchFilterCol>
            <ErpField label="สถานะรอบ" htmlFor={`${idPrefix}-status`}>
              <ErpFilterSelect
                id={`${idPrefix}-status`}
                name="status"
                options={statusOptions}
                defaultValue={filter.status ?? ""}
                searchable={false}
              />
            </ErpField>
          </ErpSearchFilterCol>
        ) : null}

        <ErpSearchFilterCol>
          <ErpField label="วันเริ่ม (จาก)" htmlFor={`${idPrefix}-dateFrom`}>
            <input
              id={`${idPrefix}-dateFrom`}
              type="date"
              name="dateFrom"
              className="form-control"
              defaultValue={filter.dateFrom ?? ""}
            />
          </ErpField>
        </ErpSearchFilterCol>

        <ErpSearchFilterCol>
          <ErpField label="วันสิ้นสุด (ถึง)" htmlFor={`${idPrefix}-dateTo`}>
            <input
              id={`${idPrefix}-dateTo`}
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
          submitDisabled={submitDisabled}
        />
      </ErpSearchActionsRow>
    </ErpSearchPanel>
  );
}
