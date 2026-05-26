import type { RoundListFilter } from "@/lib/round-list-filter";
import { matchesRoundDateRange } from "@/lib/round-list-filter";
import type { ManagerEvalQueueRow } from "@/api/ess/esspets04/types";
import {
  DEFAULT_MANAGER_EVAL_DOCUMENT_STATUS,
  isManagerEvalDocumentStatus,
} from "@/lib/manager-eval-document-status";

export type ManagerEvalQueueFilter = RoundListFilter & {
  employeeCode?: string;
  documentStatus?: string;
};

const FILTER_PARAM_KEYS = [
  "roundId",
  "masterId",
  "evaluationPeriod",
  "evaluationYear",
  "dateFrom",
  "dateTo",
  "employeeCode",
  "documentStatus",
  "templateId",
] as const;

function currentEvaluationYear(): string {
  return String(new Date().getFullYear());
}

/** ค่าเริ่มต้นหน้าค้นหาแบบประเมินพนักงาน */
export function getDefaultManagerEvalQueueFilter(): ManagerEvalQueueFilter {
  return {
    documentStatus: DEFAULT_MANAGER_EVAL_DOCUMENT_STATUS,
    evaluationYear: currentEvaluationYear(),
  };
}

function urlHasExplicitFilterParams(
  params: Record<string, string | undefined>,
): boolean {
  return FILTER_PARAM_KEYS.some((key) => params[key] !== undefined);
}

export function parseManagerEvalQueueFilter(
  params: Record<string, string | undefined>,
  options?: { applyDefaults?: boolean },
): ManagerEvalQueueFilter {
  const filter: ManagerEvalQueueFilter = {
    roundId: params.roundId?.trim() || params.templateId?.trim() || undefined,
    masterId: params.masterId?.trim() || undefined,
    evaluationPeriod: params.evaluationPeriod?.trim() || undefined,
    evaluationYear: params.evaluationYear?.trim() || undefined,
    dateFrom: params.dateFrom?.trim() || undefined,
    dateTo: params.dateTo?.trim() || undefined,
    employeeCode: params.employeeCode?.trim() || undefined,
    documentStatus: params.documentStatus?.trim() || undefined,
  };

  const applyDefaults = options?.applyDefaults !== false;
  if (applyDefaults && !urlHasExplicitFilterParams(params)) {
    const defaults = getDefaultManagerEvalQueueFilter();
    return {
      ...filter,
      documentStatus: filter.documentStatus ?? defaults.documentStatus,
      evaluationYear: filter.evaluationYear ?? defaults.evaluationYear,
    };
  }

  return filter;
}

export function hasManagerEvalQueueFilter(
  filter: ManagerEvalQueueFilter,
): boolean {
  return Boolean(
    filter.roundId ||
      filter.masterId ||
      filter.evaluationPeriod ||
      filter.evaluationYear ||
      filter.dateFrom ||
      filter.dateTo ||
      filter.employeeCode ||
      filter.documentStatus,
  );
}

export function matchesManagerEvalQueueRow(
  row: ManagerEvalQueueRow,
  filter: ManagerEvalQueueFilter,
): boolean {
  if (filter.employeeCode && row.employeeCode !== filter.employeeCode) {
    return false;
  }
  if (filter.roundId && row.templateId !== filter.roundId) {
    return false;
  }
  if (
    filter.evaluationPeriod &&
    row.evaluationPeriod !== filter.evaluationPeriod
  ) {
    return false;
  }
  if (
    filter.evaluationYear &&
    String(row.evaluationYear ?? "") !== filter.evaluationYear
  ) {
    return false;
  }
  if (
    !matchesRoundDateRange(
      row.startDate,
      row.endDate,
      filter.dateFrom,
      filter.dateTo,
    )
  ) {
    return false;
  }
  if (filter.documentStatus) {
    if (!isManagerEvalDocumentStatus(filter.documentStatus)) return false;
    if (row.documentStatus !== filter.documentStatus) return false;
  }
  return true;
}
