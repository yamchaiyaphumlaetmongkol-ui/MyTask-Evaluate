"use client";

import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { buildFilterQuery } from "@/lib/build-filter-query";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type Props = {
  viewerCode: string;
  filter: RoundListFilter;
};

/** ซิงก์ผู้ดู (เจ้าของแบบประเมิน) จาก sidebar → URL */
export function Esspets03ViewerSync({ viewerCode, filter }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useStoreHydrated();
  const currentUserCode = useCurrentUserStore((s) => s.employeeCode);

  useEffect(() => {
    if (!hydrated || !currentUserCode) return;
    if (viewerCode === currentUserCode) return;

    const qs = buildFilterQuery({ viewerCode: currentUserCode });
    router.replace(`/ess/esspets03${qs}`);
  }, [hydrated, viewerCode, currentUserCode, router, searchParams]);

  return null;
}
