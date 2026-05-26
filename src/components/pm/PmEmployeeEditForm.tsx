"use client";

import { updateEmployee } from "@/api/pm/pmms01/save_emp";
import type { EmployeeEditData } from "@/api/pm/pmms01/types";
import { EmployeeAvatar } from "@/components/pm/EmployeeAvatar";
import { BackLink } from "@/components/shared/BackLink";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  data: EmployeeEditData;
};

export function PmEmployeeEditForm({ data }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await updateEmployee({
      employeeId: form.id,
      employeeCode: form.employeeCode ?? "",
      titleName: form.titleName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      roleCode: form.roleCode,
      positionCode: form.positionCode,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/pm/pmms01");
    router.refresh();
  };

  return (
    <>
      <div className="mb-3">
        <BackLink href="/pm/pmms01">กลับรายชื่อพนักงาน</BackLink>
      </div>

      <div className="d-flex align-items-center gap-3 mb-4">
        <EmployeeAvatar
          src={form.clickupProfileImage}
          name={form.firstName || form.clickupUsername || "?"}
          size={48}
        />
        <div>
          <h1 className="h4 mb-0 erp-form-page-title">แก้ไขพนักงาน</h1>
          {form.clickupUsername && (
            <p className="text-muted small mb-0">ClickUp: {form.clickupUsername}</p>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card erp-panel border-0 mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <Input
                label="รหัสพนักงาน"
                name="employeeCode"
                value={form.employeeCode ?? ""}
                placeholder="ยังไม่กำหนด — กรอกเมื่อพร้อม"
                onChange={(e) =>
                  setForm((f) => ({ ...f, employeeCode: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4">
              <Input
                label="คำนำหน้า"
                name="titleName"
                value={form.titleName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleName: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4">
              <Input
                label="อีเมล"
                name="email"
                value={form.email}
                disabled
              />
            </div>
            <div className="col-md-6">
              <Input
                label="ชื่อ"
                name="firstName"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <Input
                label="นามสกุล"
                name="lastName"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">บทบาท (role)</label>
              <select
                className="form-select"
                value={form.roleCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roleCode: e.target.value }))
                }
              >
                <option value="">— เลือก —</option>
                {form.roles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">ตำแหน่ง (position)</label>
              <select
                className="form-select"
                value={form.positionCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, positionCode: e.target.value }))
                }
              >
                <option value="">— เลือก —</option>
                {form.positions.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <Button variant="success" disabled={saving} onClick={handleSave}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
        <Link href="/pm/pmms01" className="btn btn-outline-secondary">
          ยกเลิก
        </Link>
      </div>
    </>
  );
}
