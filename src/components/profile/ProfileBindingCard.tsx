"use client";

import { changeMyIdentity } from "@/api/identity/binding";
import type { EmployeeOption } from "@/api/_shared/employee-options";
import { UserPickerModal } from "@/components/layout/UserPickerModal";
import { Button } from "@/components/ui/Button";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  loginEmail: string;
  binding:
    | {
        id: string;
        employeeId: string;
        employeeCode: string | null;
        employeeName: string;
      }
    | null;
  employees: EmployeeOption[];
};

export function ProfileBindingCard({ loginEmail, binding, employees }: Props) {
  const router = useRouter();
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="erp-panel p-3">
        <h5 className="erp-form-page-title mb-3">โปรไฟล์การผูกตัวตน</h5>
        <p className="mb-1">
          <strong>Login email:</strong> {loginEmail}
        </p>
        {binding ? (
          <p className="mb-2">
            <strong>พนักงานที่ผูก:</strong> {binding.employeeName} (
            {binding.employeeCode ?? "ยังไม่มีรหัส"})
          </p>
        ) : (
          <p className="text-warning mb-2">
            ยังไม่พบการผูกตัวตน กรุณาเลือกผู้ใช้งาน
          </p>
        )}
        <Button variant="outline-primary" onClick={() => setOpen(true)}>
          เปลี่ยนการผูกตัวตน
        </Button>
      </div>

      <UserPickerModal
        key={`profile-${open ? "open" : "closed"}-${binding?.employeeId ?? "none"}`}
        open={open}
        employees={employees}
        selectedId={binding?.employeeId ?? ""}
        onClose={() => setOpen(false)}
        onSelect={async (employee) => {
          const res = await changeMyIdentity(employee.id);
          if (!res.ok) return { ok: false, error: res.error };
          setCurrentUser(employee);
          setOpen(false);
          router.refresh();
          return { ok: true };
        }}
        description="เลือกผู้ใช้งานใหม่สำหรับบัญชีที่ล็อกอินนี้"
      />
    </>
  );
}
