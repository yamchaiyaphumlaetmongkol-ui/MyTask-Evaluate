"use client";

import { getSessionUser } from "@/api/auth/get_session_user";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useEffect } from "react";

/**
 * Hydrate client store from server session (logged-in employee).
 */
export function AuthSessionSync() {
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);
  const clearCurrentUser = useCurrentUserStore((s) => s.clearCurrentUser);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const user = await getSessionUser();
      if (cancelled) return;

      if (!user?.employeeId) {
        clearCurrentUser();
        return;
      }

      setCurrentUser({
        id: user.employeeId,
        code: user.employeeCode,
        name: user.employeeName ?? user.username,
        profileImage: user.profileImage,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [setCurrentUser, clearCurrentUser]);

  return null;
}
