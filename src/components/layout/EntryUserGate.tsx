"use client";

import type { EmployeeOption } from "@/api/_shared/employee-options";
import { bindMyIdentity } from "@/api/identity/binding";
import { UserPickerModal } from "@/components/layout/UserPickerModal";
import { useHasCurrentUser } from "@/hooks/useHasCurrentUser";
import { useCurrentUserStore } from "@/store/currentUserStore";
import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
  employees: EmployeeOption[];
  loginEmployee: EmployeeOption | null;
  children: ReactNode;
};

/** บังคับเลือกผู้ใช้งาน 1 คนก่อนใช้งานระบบ */
export function EntryUserGate({ employees, loginEmployee, children }: Props) {
  const { hydrated, hasUser, employeeId } = useHasCurrentUser();
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);
  const clearCurrentUser = useCurrentUserStore((s) => s.clearCurrentUser);

  useEffect(() => {
    if (!hydrated || employees.length === 0) return;

    if (loginEmployee?.code) {
      const current = useCurrentUserStore.getState();
      if (
        current.employeeId !== loginEmployee.id ||
        current.employeeCode !== loginEmployee.code
      ) {
        setCurrentUser(loginEmployee);
      }
      return;
    }

    // ไม่มี binding ในฐานข้อมูล: ห้ามเชื่อ local persisted identity เดิม
    if (useCurrentUserStore.getState().employeeId) {
      clearCurrentUser();
    }
    return;
  }, [
    hydrated,
    employees,
    loginEmployee,
    setCurrentUser,
    clearCurrentUser,
  ]);

  if (!hydrated) {
    return (
      <div className="erp-entry-user-gate erp-entry-user-gate--loading">
        <p className="text-muted mb-0">กำลังโหลด...</p>
      </div>
    );
  }

  const allowPicker = !loginEmployee;
  const hasMappedLoginEmployee = Boolean(loginEmployee?.code);
  const canAccess = hasUser || hasMappedLoginEmployee;

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

      {allowPicker ? (
        <UserPickerModal
          key={`entry-${!hasUser ? "open" : "closed"}-${employeeId ?? "none"}`}
          open={!hasUser}
          employees={employees}
          selectedId={employeeId ?? ""}
          onClose={() => {}}
          onSelect={async (employee) => {
            const res = await bindMyIdentity(employee.id);
            if (!res.ok) return { ok: false, error: res.error };
            setCurrentUser(employee);
            return { ok: true };
          }}
          required
          requireCode
          description="เลือกพนักงาน 1 คนเพื่อผูกกับอีเมลที่ล็อกอินครั้งแรก — หากยังไม่มีรหัส ระบบจะพาไปหน้ากรอกข้อมูลทันที"
        />
      ) : null}

      {!loginEmployee ? null : !loginEmployee.code ? (
        <div className="erp-entry-user-gate">
          <div className="alert alert-warning mb-0">
            บัญชีที่เข้าสู่ระบบยังไม่ได้ผูกกับรหัสพนักงาน โปรดติดต่อผู้ดูแลระบบ
          </div>
        </div>
      ) : null}
    </>
  );
}
