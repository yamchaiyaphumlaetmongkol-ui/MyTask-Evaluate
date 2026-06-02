"use client";

import type { EmployeeOption } from "@/api/_shared/employee-options";
import { UserPickerModal } from "@/components/layout/UserPickerModal";
import { useHasCurrentUser } from "@/hooks/useHasCurrentUser";
import { useCurrentUserStore } from "@/store/currentUserStore";
import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
  employees: EmployeeOption[];
  children: ReactNode;
};

/** บังคับเลือกผู้ใช้งาน 1 คนก่อนใช้งานระบบ */
export function EntryUserGate({ employees, children }: Props) {
  const { hydrated, hasUser, employeeId } = useHasCurrentUser();
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);

  useEffect(() => {
    if (!hydrated || employees.length === 0) return;
  }, [hydrated, employees]);

  if (!hydrated) {
    return (
      <div className="erp-entry-user-gate erp-entry-user-gate--loading">
        <p className="text-muted mb-0">กำลังโหลด...</p>
      </div>
    );
  }

  const canAccess = hasUser;

  return (
    <>
      <div
        className={
          canAccess
            ? undefined
            : "erp-entry-user-gate__content--blocked"
        }
        aria-hidden={!canAccess}
      >
        {children}
      </div>

      {!canAccess ? (
        <div className="erp-entry-user-gate" aria-hidden />
      ) : null}

      <UserPickerModal
        key={`entry-${!hasUser ? "open" : "closed"}-${employeeId ?? "none"}`}
        open={!hasUser}
        employees={employees}
        selectedId={employeeId ?? ""}
        onClose={() => {}}
        onSelect={async (employee) => {
          setCurrentUser(employee);
          return { ok: true };
        }}
        required
        requireCode
        description="เลือกพนักงาน 1 คนเพื่อใช้งานระบบ"
      />
    </>
  );
}
