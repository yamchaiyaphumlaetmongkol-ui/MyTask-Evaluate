"use client";

import {
  deletePosition,
  savePosition,
  updatePosition,
} from "@/api/pm/pmms03/save_position";
import type { PositionRow } from "@/api/pm/pmms03/types";
import { ClientTableFilterPanel } from "@/components/shared/ClientTableFilterPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { filterBySearch } from "@/lib/filter-rows";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = { rows: PositionRow[] };

const emptyForm = {
  positionCode: "",
  positionName: "",
};

export function PositionFormSection({ rows }: Props) {
  const router = useRouter();
  const [positionSearch, setPositionSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filterBySearch(
        rows,
        positionSearch,
        (r) => `${r.positionCode} ${r.positionName}`,
      ),
    [rows, positionSearch],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (row: PositionRow) => {
    setEditingId(row.id);
    setForm({
      positionCode: row.positionCode,
      positionName: row.positionName,
    });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload = {
      positionCode: form.positionCode,
      positionName: form.positionName,
    };

    const res = editingId
      ? await updatePosition({ positionId: editingId, ...payload })
      : await savePosition(payload);

    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    resetForm();
    router.refresh();
  };

  const handleDelete = async (row: PositionRow) => {
    if (!confirm(`ลบตำแหน่ง ${row.positionCode} — ${row.positionName}?`)) return;
    setDeletingId(row.id);
    setError(null);
    const res = await deletePosition(row.id);
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
        {editingId ? "แก้ไขตำแหน่ง (Position)" : "สร้างตำแหน่ง (Position)"}
      </h1>

      <div className="card erp-panel border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <Input
                label="รหัสตำแหน่ง"
                value={form.positionCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, positionCode: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <Input
                label="ชื่อตำแหน่ง"
                value={form.positionName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, positionName: e.target.value }))
                }
              />
            </div>
          </div>
          {error && (
            <div className="alert alert-danger py-2 mt-3 small">{error}</div>
          )}
          <div className="d-flex flex-wrap gap-2 mt-3">
            <Button variant="success" disabled={saving} onClick={handleSave}>
              {saving
                ? "กำลังบันทึก..."
                : editingId
                  ? "บันทึกการแก้ไข"
                  : "บันทึกตำแหน่ง"}
            </Button>
            {editingId && (
              <Button variant="outline-secondary" onClick={resetForm}>
                ยกเลิกการแก้ไข
              </Button>
            )}
          </div>
        </div>
      </div>

      <h2 className="h6 text-erp-primary">รายการตำแหน่ง</h2>
      <ClientTableFilterPanel
        fields={[
          {
            id: "pm-position-search",
            label: "ค้นหา",
            value: positionSearch,
            onChange: setPositionSearch,
            placeholder: "รหัสหรือชื่อตำแหน่ง...",
          },
        ]}
      />
      <div className="table-responsive">
        <table className="table table-sm table-striped align-middle">
          <thead className="erp-table-head">
            <tr>
              <th>รหัส</th>
              <th>ชื่อ</th>
              <th className="text-center">แก้ไข</th>
              <th className="text-center">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.positionCode}</td>
                <td>{p.positionName}</td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => startEdit(p)}
                  >
                    แก้ไข
                  </button>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === p.id}
                    onClick={() => handleDelete(p)}
                  >
                    {deletingId === p.id ? "..." : "ลบ"}
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
