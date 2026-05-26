"use client";

import {
  readPageFilter,
  stripManagerEvalFilterParams,
  writePageFilter,
} from "@/lib/erp-page-filter-storage";
import {
  getDefaultManagerEvalQueueFilter,
  type ManagerEvalQueueFilter,
  parseManagerEvalQueueFilter,
} from "@/lib/manager-eval-queue-filter";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

const PAGE_KEY_ESSPETS04 = "/ess/esspets04";

function storageKey(pageKey: string, managerCode: string): string {
  const code = managerCode.trim();
  return code ? `${pageKey}:${code}` : pageKey;
}

function mergeFilter(
  stored: ManagerEvalQueueFilter | null,
  fromUrl: ManagerEvalQueueFilter,
): ManagerEvalQueueFilter {
  if (!stored) return fromUrl;
  const merged = { ...stored };
  for (const [key, value] of Object.entries(fromUrl) as [
    keyof ManagerEvalQueueFilter,
    string | undefined,
  ][]) {
    if (value) merged[key] = value;
  }
  return merged;
}

function applyInitialDefaults(
  filter: ManagerEvalQueueFilter,
  hadStored: boolean,
  hadUrlFilters: boolean,
): ManagerEvalQueueFilter {
  if (hadStored || hadUrlFilters) return filter;
  const defaults = getDefaultManagerEvalQueueFilter();
  return {
    ...filter,
    documentStatus: filter.documentStatus ?? defaults.documentStatus,
    evaluationYear: filter.evaluationYear ?? defaults.evaluationYear,
  };
}

function urlHadFilterParams(search: string): boolean {
  const sp = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const keys = [
    "roundId",
    "masterId",
    "evaluationPeriod",
    "evaluationYear",
    "dateFrom",
    "dateTo",
    "employeeCode",
    "documentStatus",
    "templateId",
  ];
  return keys.some((k) => sp.has(k));
}

/** ตัวกรอง ESSPETS04 — sessionStorage แยกตาม manager + ค่าเริ่มต้น */
export function useStoredManagerEvalFilter(
  managerCode: string,
  pageKey: string = PAGE_KEY_ESSPETS04,
) {
  const pathname = usePathname();
  const router = useRouter();
  const scopedKey = storageKey(pageKey, managerCode);
  const [filter, setFilter] = useState<ManagerEvalQueueFilter>(() =>
    getDefaultManagerEvalQueueFilter(),
  );
  const [ready, setReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setReady(false);

    const search = window.location.search;
    const fromUrl = parseManagerEvalQueueFilter(
      Object.fromEntries(new URLSearchParams(search)),
    );
    const stored = readPageFilter<ManagerEvalQueueFilter>(scopedKey);
    const hadUrlFilters = urlHadFilterParams(search);
    const merged = applyInitialDefaults(
      mergeFilter(stored, fromUrl),
      Boolean(stored),
      hadUrlFilters,
    );
    setFilter(merged);
    writePageFilter(scopedKey, merged);

    const { cleaned, hadFilter } = stripManagerEvalFilterParams(search);
    if (hadFilter) {
      const nextQs = cleaned ? `?${cleaned}` : "";
      const nextUrl = `${pathname}${nextQs}`;
      const current = window.location.pathname + window.location.search;
      if (current !== nextUrl) {
        router.replace(nextUrl, { scroll: false });
      }
    }

    setReady(true);
  }, [scopedKey, pathname]);

  const applyFilter = useCallback(
    (next: ManagerEvalQueueFilter) => {
      writePageFilter(scopedKey, next);
      startTransition(() => setFilter(next));
    },
    [scopedKey],
  );

  const clearFilter = useCallback(() => {
    const defaults = getDefaultManagerEvalQueueFilter();
    writePageFilter(scopedKey, defaults);
    startTransition(() => setFilter(defaults));
  }, [scopedKey]);

  return { filter, applyFilter, clearFilter, ready, isPending };
}
