import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import type { ManagerEvalFilterOptions } from "@/api/ess/esspets04/types";
import type { ManagerEvalQueueRow } from "@/api/ess/esspets04/types";
import { uniqueSelectOptions } from "@/lib/filter-rows";

export function buildManagerEvalFilterOptions(
  rows: ManagerEvalQueueRow[],
  roundOptions: RoundListFilterOptions,
): ManagerEvalFilterOptions {
  const byCode = new Map(rows.map((r) => [r.employeeCode, r.employeeName]));
  const employees = uniqueSelectOptions(rows.map((r) => r.employeeCode)).map(
    (o) => ({
      value: o.value,
      label: `${byCode.get(o.value) ?? o.label} (${o.value})`,
    }),
  );

  return {
    ...roundOptions,
    employees,
  };
}
