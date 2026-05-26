import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import type { EvalStep } from "@/api/ess/esspets02/types";
import type { ManagerEvalDocumentStatus } from "@/lib/manager-eval-document-status";

export type FilterSelectOption = { value: string; label: string };

export type ManagerEvalFilterOptions = RoundListFilterOptions & {
  employees: FilterSelectOption[];
};

/** คิวประเมินพนักงาน — 1 แถวต่อพนักงาน + แบบประเมิน */
export type ManagerEvalQueueRow = {
  employeeCode: string;
  employeeName: string;
  templateId: string;
  templateName: string;
  evaluationPeriod: string | null;
  evaluationYear: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  canEvaluate: boolean;
  documentStatus: ManagerEvalDocumentStatus;
};

export type ManagerEvalSession = {
  templateId: string;
  templateName: string;
  employeeCode: string;
  employeeName: string;
  managerCode: string;
  managerName: string;
  positionName: string | null;
  steps: EvalStep[];
};

export type { EmployeeOption as ManagerOption } from "@/api/_shared/employee-options";
