"use client";

import { updateEmployee } from "@/api/pm/pmms01/save_emp";
import type { EmployeeEditData } from "@/api/pm/pmms01/types";
import type { EmployeeOption } from "@/api/_shared/employee-options";
import { ErpField } from "@/components/erp";
import { EmployeeAvatar } from "@/components/pm/EmployeeAvatar";
import { employeeDisplayName } from "@/lib/employee-display";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type UserPickerSetupFormValues = {
  employeeCode: string;
  titleName: string;
  firstName: string;
  lastName: string;
  roleCode: string;
  positionCode: string;
};

type Props = {
  data: EmployeeEditData;
  formId: string;
  onSuccess: (employee: EmployeeOption) => void;
  onSavingChange?: (saving: boolean) => void;
};

export function UserPickerEmployeeSetupForm({
  data,
  formId,
  onSuccess,
  onSavingChange,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<UserPickerSetupFormValues>({
    employeeCode: data.employeeCode ?? "",
    titleName: data.titleName,
    firstName: data.firstName,
    lastName: data.lastName,
    roleCode: data.roleCode,
    positionCode: data.positionCode,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = form.employeeCode.trim();
    if (!code) {
      setError("กรุณากรอกรหัสพนักงาน");
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    onSavingChange?.(true);
    setError(null);

    const res = await updateEmployee({
      employeeId: data.id,
      employeeCode: code,
      titleName: form.titleName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      roleCode: form.roleCode,
      positionCode: form.positionCode,
    });

    onSavingChange?.(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    const employee: EmployeeOption = {
      id: data.id,
      code: res.employeeCode,
      name: employeeDisplayName({
        titleName: form.titleName,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        clickupUsername: data.clickupUsername,
      }),
      profileImage: data.clickupProfileImage,
    };

    router.refresh();
    onSuccess(employee);
  };

  return (
    <form
      id={formId}
      className="erp-user-picker-setup-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="erp-user-picker-setup-form__header">
        <EmployeeAvatar
          src={data.clickupProfileImage}
          name={employeeDisplayName(data)}
          size={52}
        />
        <div className="min-w-0">
          <p className="erp-user-picker-setup-form__title mb-0">
            กรอกข้อมูลพนักงาน
          </p>
          {data.clickupUsername ? (
            <p className="text-muted small mb-0">
              ClickUp: {data.clickupUsername}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {error}
        </div>
      ) : null}

      <div className="row g-3">
        <div className="col-md-6">
          <ErpField label="รหัสพนักงาน" htmlFor={`${formId}-code`} required>
            <input
              id={`${formId}-code`}
              className="form-control"
              value={form.employeeCode}
              placeholder="เช่น E001"
              autoComplete="off"
              onChange={(e) =>
                setForm((f) => ({ ...f, employeeCode: e.target.value }))
              }
            />
          </ErpField>
        </div>
        <div className="col-md-6">
          <ErpField label="คำนำหน้า" htmlFor={`${formId}-title`}>
            <input
              id={`${formId}-title`}
              className="form-control"
              value={form.titleName}
              placeholder="เช่น นาย / นางสาว"
              onChange={(e) =>
                setForm((f) => ({ ...f, titleName: e.target.value }))
              }
            />
          </ErpField>
        </div>
        <div className="col-md-6">
          <ErpField label="ชื่อ" htmlFor={`${formId}-first`} required>
            <input
              id={`${formId}-first`}
              className="form-control"
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
            />
          </ErpField>
        </div>
        <div className="col-md-6">
          <ErpField label="นามสกุล" htmlFor={`${formId}-last`} required>
            <input
              id={`${formId}-last`}
              className="form-control"
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
            />
          </ErpField>
        </div>
        <div className="col-md-6">
          <ErpField label="บทบาท (Role)" htmlFor={`${formId}-role`}>
            <select
              id={`${formId}-role`}
              className="form-select"
              value={form.roleCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, roleCode: e.target.value }))
              }
            >
              <option value="">— เลือก —</option>
              {data.roles.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </ErpField>
        </div>
        <div className="col-md-6">
          <ErpField label="ตำแหน่ง (Position)" htmlFor={`${formId}-position`}>
            <select
              id={`${formId}-position`}
              className="form-select"
              value={form.positionCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, positionCode: e.target.value }))
              }
            >
              <option value="">— เลือก —</option>
              {data.positions.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </ErpField>
        </div>
        <div className="col-12">
          <ErpField label="อีเมล" htmlFor={`${formId}-email`}>
            <input
              id={`${formId}-email`}
              className="form-control"
              value={data.email}
              disabled
              readOnly
            />
          </ErpField>
        </div>
      </div>
    </form>
  );
}
