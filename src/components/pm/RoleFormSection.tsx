"use client";

import { deleteRole, saveRole, updateRole } from "@/api/pm/pmms02/save_role";
import type { RoleRow } from "@/api/pm/pmms02/types";
import { ClientTableFilterPanel } from "@/components/shared/ClientTableFilterPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { filterBySearch } from "@/lib/filter-rows";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = { rows: RoleRow[] };

const emptyForm = {
  roleCode: "",
  roleName: "",
  roleLevel: null as number | null,
};

export function RoleFormSection({ rows }: Props) {
  const router = useRouter();
  const [roleSearch, setRoleSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filterBySearch(
        rows,
        roleSearch,
        (r) => `${r.roleCode} ${r.roleName}`,
      ),
    [rows, roleSearch],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (row: RoleRow) => {
    setEditingId(row.id);
    setForm({
      roleCode: row.roleCode,
      roleName: row.roleName,
      roleLevel: row.roleLevel,
    });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload = {
      roleCode: form.roleCode,
      roleName: form.roleName,
      roleLevel: form.roleLevel,
    };

    const res = editingId
      ? await updateRole({ roleId: editingId, ...payload })
      : await saveRole(payload);

    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    resetForm();
    router.refresh();
  };

  const handleDelete = async (row: RoleRow) => {
    if (!confirm(`ลบบทบาท ${row.roleCode} — ${row.roleName}?`)) return;
    setDeletingId(row.id);
    setError(null);
    const res = await deleteRole(row.id);
    setDeletingId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (editingId === row.id) resetForm();
    router.refresh();
  };

  return (
    <>
      <h1 className="h4 mb-4 erp-form-page-title">
        {editingId ? "แก้ไขบทบาท (Role)" : "สร้างบทบาท (Role)"}
      </h1>

      <div className="card erp-panel border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <Input
                label="รหัสบทบาท"
                value={form.roleCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roleCode: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4">
              <Input
                label="ชื่อบทบาท"
                value={form.roleName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roleName: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4">
              <NumberInput
                label="ระดับ (ถ้ามี)"
                nullable
                min={0}
                value={form.roleLevel}
                onValueChange={(roleLevel) =>
                  setForm((f) => ({ ...f, roleLevel }))
                }
              />
            </div>
          </div>
          {error && (
            <div className="alert alert-danger py-2 mt-3 small">
              {error}
            </div>
          )}
          <div className="d-flex flex-wrap gap-2 mt-3">
            <Button variant="success" disabled={saving} onClick={handleSave}>
              {saving
                ? "กำลังบันทึก..."
                : editingId
                  ? "บันทึกการแก้ไข"
                  : "บันทึกบทบาท"}
            </Button>
            {editingId && (
              <Button variant="outline-secondary" onClick={resetForm}>
                ยกเลิกการแก้ไข
              </Button>
            )}
          </div>
        </div>
      </div>

      <h2 className="h6 text-erp-primary">รายการบทบาท</h2>
      <ClientTableFilterPanel
        fields={[
          {
            id: "pm-role-search",
            label: "ค้นหา",
            value: roleSearch,
            onChange: setRoleSearch,
            placeholder: "รหัสหรือชื่อบทบาท...",
          },
        ]}
      />
      <div className="table-responsive">
        <table className="table table-sm table-striped align-middle">
          <thead className="erp-table-head">
            <tr>
              <th>รหัส</th>
              <th>ชื่อ</th>
              <th>ระดับ</th>
              <th className="text-center">แก้ไข</th>
              <th className="text-center">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.roleCode}</td>
                <td>{r.roleName}</td>
                <td>{r.roleLevel ?? "—"}</td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => startEdit(r)}
                  >
                    แก้ไข
                  </button>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === r.id}
                    onClick={() => handleDelete(r)}
                  >
                    {deletingId === r.id ? "..." : "ลบ"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
