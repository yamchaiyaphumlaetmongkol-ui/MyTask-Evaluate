"use client";

import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { buildFilterQuery } from "@/lib/build-filter-query";
import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  managerCode: string;
  filter: ManagerEvalQueueFilter;
};

/** ซิงก์ผู้ประเมิน (manager) จากผู้ใช้ที่เลือก */
export function Esspets04ContextSync({ managerCode, filter }: Props) {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const currentUserCode = useCurrentUserStore((s) => s.employeeCode);

  useEffect(() => {
    if (!hydrated || !currentUserCode) return;
    if (managerCode === currentUserCode) return;

    const qs = buildFilterQuery({ managerCode: currentUserCode });
    router.replace(`/ess/esspets04${qs}`);
  }, [hydrated, managerCode, currentUserCode, router]);

  return null;
}
