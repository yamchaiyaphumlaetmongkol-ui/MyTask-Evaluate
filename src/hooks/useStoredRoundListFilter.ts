"use client";

import {
  readPageFilter,
  stripRoundListFilterParams,
  writePageFilter,
} from "@/lib/erp-page-filter-storage";
import { parseRoundListSearchParams } from "@/lib/parse-round-list-search-params";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

function mergeFilter(
  stored: RoundListFilter | null,
  fromUrl: RoundListFilter,
): RoundListFilter {
  if (!stored) return fromUrl;
  const merged = { ...stored };
  for (const [key, value] of Object.entries(fromUrl) as [
    keyof RoundListFilter,
    string | undefined,
  ][]) {
    if (value) merged[key] = value;
  }
  return merged;
}

/** ตัวกรองค้นหา — เก็บใน sessionStorage, URL เหลือแค่ path โปรแกรม */
export function useStoredRoundListFilter(pageKey: string) {
  const pathname = usePathname();
  const router = useRouter();
  const [filter, setFilter] = useState<RoundListFilter>({});
  const [ready, setReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fromUrl = parseRoundListSearchParams(
      Object.fromEntries(new URLSearchParams(window.location.search)),
    );
    const stored = readPageFilter<RoundListFilter>(pageKey);
    const merged = mergeFilter(stored, fromUrl);
    setFilter(merged);
    if (Object.values(merged).some(Boolean)) {
      writePageFilter(pageKey, merged);
    }

    const { cleaned } = stripRoundListFilterParams(window.location.search);
    const nextUrl = cleaned ? `${pathname}?${cleaned}` : pathname;
    if (window.location.pathname + window.location.search !== nextUrl) {
      router.replace(nextUrl, { scroll: false });
    }

    setReady(true);
  }, [pageKey, pathname, router]);

  const applyFilter = useCallback(
    (next: RoundListFilter) => {
      writePageFilter(pageKey, next);
      startTransition(() => setFilter(next));
    },
    [pageKey],
  );

  const clearFilter = useCallback(() => {
    writePageFilter(pageKey, {});
    startTransition(() => setFilter({}));
  }, [pageKey]);

  return { filter, applyFilter, clearFilter, ready, isPending };
}
