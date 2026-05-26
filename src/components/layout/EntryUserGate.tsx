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
  const clearCurrentUser = useCurrentUserStore((s) => s.clearCurrentUser);

  useEffect(() => {
    if (!hydrated || employees.length === 0) return;

    if (!employeeId) return;

    const match = employees.find((e) => e.id === employeeId);
    if (match?.code) {
      if (useCurrentUserStore.getState().employeeCode !== match.code) {
        setCurrentUser(match);
      }
      return;
    }

    clearCurrentUser();
  }, [hydrated, employees, employeeId, setCurrentUser, clearCurrentUser]);

  if (!hydrated) {
    return (
      <div className="erp-entry-user-gate erp-entry-user-gate--loading">
        <p className="text-muted mb-0">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={hasUser ? undefined : "erp-entry-user-gate__content--blocked"}
        aria-hidden={!hasUser}
      >
        {children}
      </div>

      {!hasUser ? <div className="erp-entry-user-gate" aria-hidden /> : null}

      <UserPickerModal
        open={!hasUser}
        employees={employees}
        selectedId={employeeId ?? ""}
        onClose={() => {}}
        onSelect={setCurrentUser}
        required
        requireCode
        description="เลือกพนักงาน 1 คน แล้วกดยืนยัน — หากยังไม่มีรหัส ระบบจะพาไปหน้ากรอกข้อมูลทันที"
      />
    </>
  );
}
