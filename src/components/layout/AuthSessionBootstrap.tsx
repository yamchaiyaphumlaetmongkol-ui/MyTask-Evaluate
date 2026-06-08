"use client";

import type { SessionEmployee } from "@/lib/auth/session-employee";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useEffect } from "react";

/** Sync client store จาก session จริงบน server (ทับ localStorage เก่า) */
export function AuthSessionBootstrap({
  employee,
}: {
  employee: SessionEmployee | null;
}) {
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);
  const clearCurrentUser = useCurrentUserStore((s) => s.clearCurrentUser);

  useEffect(() => {
    if (!employee?.id) {
      clearCurrentUser();
      return;
    }
    setCurrentUser({
      id: employee.id,
      code: employee.code,
      name: employee.name,
      profileImage: employee.profileImage,
    });
  }, [employee, setCurrentUser, clearCurrentUser]);

  return null;
}
