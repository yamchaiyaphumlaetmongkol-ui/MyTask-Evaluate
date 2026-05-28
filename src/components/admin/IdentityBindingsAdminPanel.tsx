"use client";

import { adminForceBind, adminUnbind } from "@/api/identity/binding";
import type { EmployeeOption } from "@/api/_shared/employee-options";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatThaiDateTime } from "@/lib/format-datetime";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Row = {
  id: string;
  loginEmail: string;
  employeeId: string;
  employeeCode: string | null;
  employeeName: string;
  clickupUserId: string | null;
  clickupEmail: string | null;
  updatedDate: string;
};

type Props = {
  rows: Row[];
  employees: EmployeeOption[];
};

export function IdentityBindingsAdminPanel({ rows, employees }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        value: e.id,
        label: `${e.name}${e.code ? ` (${e.code})` : ""}`,
      })),
    [employees],
  );
  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      [row.loginEmail, row.employeeCode ?? "", row.employeeName, row.clickupEmail ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [rows, search]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="erp-form-page-title mb-0">Identity Bindings (Admin)</h4>
        <Button variant="success" onClick={() => setOpen(true)}>
          Force Bind
        </Button>
      </div>

      {error ? <div className="alert alert-danger py-2 small">{error}</div> : null}
      <div className="mb-3">
        <Input
          label="ค้นหา binding"
          name="binding-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา login email / employee / clickup email"
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="erp-table-head">
            <tr>
              <th>Login Email</th>
              <th>Employee</th>
              <th>ClickUp</th>
              <th>Updated</th>
              <th className="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.loginEmail}</td>
                <td>
                  {row.employeeName} ({row.employeeCode ?? "—"})
                </td>
                <td>
                  {row.clickupUserId ?? "—"}
                  {row.clickupEmail ? (
                    <div className="small text-muted">{row.clickupEmail}</div>
                  ) : null}
                </td>
                <td>{formatThaiDateTime(row.updatedDate)}</td>
                <td className="text-center">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      const res = await adminUnbind(row.id);
                      if (!res.ok) {
                        setError(res.error);
                        return;
                      }
                      setError(null);
                      router.refresh();
                    }}
                  >
                    Unbind
                  </Button>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  ยังไม่มีข้อมูล binding
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title="Admin Force Bind"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              ปิด
            </Button>
            <Button
              variant="success"
              onClick={async () => {
                const res = await adminForceBind(targetEmail, targetEmployeeId);
                if (!res.ok) {
                  setError(res.error);
                  return;
                }
                setError(null);
                setOpen(false);
                setTargetEmail("");
                setTargetEmployeeId("");
                router.refresh();
              }}
            >
              ยืนยัน
            </Button>
          </>
        }
      >
        <Input
          label="Login email"
          name="admin-bind-email"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
        />
        <div className="mb-3">
          <label className="form-label" htmlFor="admin-bind-employee">
            Employee
          </label>
          <select
            id="admin-bind-employee"
            className="form-select"
            value={targetEmployeeId}
            onChange={(e) => setTargetEmployeeId(e.target.value)}
          >
            <option value="">— เลือกพนักงาน —</option>
            {employeeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </>
  );
}
