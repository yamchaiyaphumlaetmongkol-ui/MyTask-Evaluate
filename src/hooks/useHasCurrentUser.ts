"use client";

import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useCurrentUserStore } from "@/store/currentUserStore";

/** รอ hydrate แล้วตรวจว่ามีผู้ใช้ที่เลือกพร้อมรหัสพนักงาน */
export function useHasCurrentUser() {
  const hydrated = useStoreHydrated();
  const employeeId = useCurrentUserStore((s) => s.employeeId);
  const employeeCode = useCurrentUserStore((s) => s.employeeCode);

  const hasUser = Boolean(hydrated && employeeId && employeeCode);

  return { hydrated, hasUser, employeeId, employeeCode };
}
