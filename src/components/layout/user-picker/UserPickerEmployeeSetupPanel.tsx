"use client";

import { fetchEmployeeForSetup } from "@/api/pm/pmms01/fetch_employee_for_setup";
import type { EmployeeOption } from "@/api/_shared/employee-options";
import { UserPickerEmployeeSetupForm } from "@/components/layout/user-picker/UserPickerEmployeeSetupForm";
import { useEffect, useState } from "react";

const SETUP_FORM_ID = "erp-user-picker-setup-form";

type Props = {
  employeeId: string;
  onSuccess: (employee: EmployeeOption) => void;
  onSavingChange?: (saving: boolean) => void;
};

export function UserPickerEmployeeSetupPanel({
  employeeId,
  onSuccess,
  onSavingChange,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<
    Awaited<ReturnType<typeof fetchEmployeeForSetup>>
  >(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setData(null);

    fetchEmployeeForSetup(employeeId).then((row) => {
      if (cancelled) return;
      if (!row) {
        setLoadError("ไม่พบข้อมูลพนักงาน");
        setLoading(false);
        return;
      }
      setData(row);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  return (
    <section
      className="erp-user-picker-setup"
      aria-label="กรอกข้อมูลพนักงาน"
    >
      {loading ? (
        <div className="erp-user-picker-setup__loading">
          <div className="spinner-border spinner-border-sm text-erp-primary" />
          <span className="small text-muted">กำลังโหลดข้อมูล...</span>
        </div>
      ) : loadError ? (
        <div className="alert alert-warning py-2 small mb-0">{loadError}</div>
      ) : data ? (
        <UserPickerEmployeeSetupForm
          key={employeeId}
          data={data}
          formId={SETUP_FORM_ID}
          onSuccess={onSuccess}
          onSavingChange={onSavingChange}
        />
      ) : null}
    </section>
  );
}

export { SETUP_FORM_ID };
