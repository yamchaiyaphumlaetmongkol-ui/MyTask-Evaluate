"use client";

import { getClickUpUsersForImport } from "@/api/pm/pmms01/get_clickup_users";
import { syncClickUpEmployees } from "@/api/pm/pmms01/save_emp";
import type { ClickUpUserOption } from "@/api/pm/pmms01/types";
import { EmployeeAvatar } from "@/components/pm/EmployeeAvatar";
import { FilteredSelectAllBar } from "@/components/shared/FilteredSelectAllBar";
import { TableSearchBar } from "@/components/shared/TableSearchBar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { filterBySearch } from "@/lib/filter-rows";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ClickUpImportModal({ open, onClose }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<ClickUpUserOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSelected(new Set());
    setSearch("");

    void getClickUpUsersForImport().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const all = res.data.users;
      setUsers(all);
      setSelected(
        new Set(all.filter((u) => u.alreadyImported).map((u) => u.id)),
      );
    });
  }, [open]);

  const filtered = useMemo(
    () =>
      filterBySearch(users, search, (u) =>
        [u.username, u.email, u.employeeCode].filter(Boolean).join(" "),
      ),
    [users, search],
  );

  const filteredIds = useMemo(() => filtered.map((u) => u.id), [filtered]);

  const toImport = useMemo(
    () => users.filter((u) => selected.has(u.id) && !u.alreadyImported),
    [users, selected],
  );

  const toRemove = useMemo(
    () =>
      users.filter(
        (u) =>
          u.alreadyImported &&
          u.employeeId &&
          !selected.has(u.id),
      ),
    [users, selected],
  );

  const importCount = toImport.length;
  const removeCount = toRemove.length;
  const hasChanges = importCount > 0 || removeCount > 0;

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const someFilteredSelected = filteredIds.some((id) => selected.has(id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setError("ไม่มีการเปลี่ยนแปลง — ติ๊กเพิ่มหรือยกเลิกรายการ");
      return;
    }

    if (removeCount > 0) {
      const preview = toRemove
        .slice(0, 5)
        .map((u) => u.username)
        .join(", ");
      const more = removeCount > 5 ? ` และอีก ${removeCount - 5} คน` : "";
      const ok = confirm(
        `นำออกจากระบบ ${removeCount} คน?\n${preview}${more}\n\n(เป็นการปิดการใช้งาน ไม่ลบจาก ClickUp)`,
      );
      if (!ok) return;
    }

    setSaving(true);
    setError(null);

    const res = await syncClickUpEmployees({
      importUsers: toImport.map((u) => ({
        clickupUserId: u.id,
        username: u.username,
        email: u.email,
        profilePicture: u.profilePicture,
      })),
      removeEmployeeIds: toRemove
        .map((u) => u.employeeId)
        .filter((id): id is string => Boolean(id)),
    });

    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.refresh();
    onClose();
  };

  const saveLabel = useMemo(() => {
    if (saving) return "กำลังบันทึก...";
    const parts: string[] = [];
    if (importCount > 0) parts.push(`นำเข้า ${importCount}`);
    if (removeCount > 0) parts.push(`นำออก ${removeCount}`);
    return parts.length > 0 ? `บันทึก (${parts.join(" · ")})` : "บันทึก";
  }, [saving, importCount, removeCount]);

  return (
    <Modal
      open={open}
      title="จัดการพนักงานจาก ClickUp"
      onClose={onClose}
      size="lg"
      scrollable
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button
            variant="success"
            onClick={handleSave}
            disabled={saving || loading || !hasChanges}
          >
            {saveLabel}
          </Button>
        </>
      }
    >
      <p className="text-muted small mb-3">
        ติ๊ก = อยู่ในระบบ · ยกเลิกติ๊กคนที่มีอยู่แล้ว = นำออก · ติ๊กคนใหม่ =
        นำเข้า
      </p>

      {error && (
        <div className="alert alert-danger py-2 small">{error}</div>
      )}

      {loading ? (
        <p className="text-muted mb-0">กำลังโหลดจาก ClickUp...</p>
      ) : (
        <>
          <TableSearchBar
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาในรายการ ClickUp..."
            className="mb-2"
          />
          <div className="erp-clickup-import-list border rounded">
            <div className="erp-clickup-import-list__toolbar sticky-top">
              <FilteredSelectAllBar
                filteredCount={filtered.length}
                allSelected={allFilteredSelected}
                someSelected={someFilteredSelected}
                onToggleAll={toggleSelectAllFiltered}
              />
            </div>
            <div className="list-group list-group-flush">
              {filtered.map((u) => {
                const willRemove =
                  u.alreadyImported && u.employeeId && !selected.has(u.id);
                const willImport = !u.alreadyImported && selected.has(u.id);

                return (
                  <label
                    key={u.id}
                    className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-2"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input mt-0 flex-shrink-0"
                      checked={selected.has(u.id)}
                      onChange={() => toggle(u.id)}
                    />
                    <EmployeeAvatar src={u.profilePicture} name={u.username} />
                    <span className="flex-grow-1 min-w-0">
                      <span className="fw-semibold">{u.username}</span>
                      {u.email ? (
                        <span className="text-muted small d-block">{u.email}</span>
                      ) : null}
                      {u.alreadyImported ? (
                        <span className="text-muted small d-block">
                          อยู่ในระบบแล้ว
                          {u.employeeCode ? ` · รหัส ${u.employeeCode}` : ""}
                        </span>
                      ) : null}
                    </span>
                    {willRemove ? (
                      <span className="badge rounded-pill text-bg-danger flex-shrink-0">
                        จะนำออก
                      </span>
                    ) : willImport ? (
                      <span className="badge rounded-pill text-bg-primary flex-shrink-0">
                        จะนำเข้า
                      </span>
                    ) : u.alreadyImported ? (
                      <span className="badge rounded-pill text-bg-success flex-shrink-0">
                        ในระบบ
                      </span>
                    ) : null}
                  </label>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-muted small text-center py-3 mb-0">
                  {users.length === 0
                    ? "ไม่พบสมาชิกใน ClickUp"
                    : "ไม่พบรายการที่ตรงกับคำค้นหา"}
                </p>
              )}
            </div>
          </div>
          {users.length > 0 && (
            <p className="text-muted small mt-2 mb-0">
              ในระบบ {users.filter((u) => u.alreadyImported).length} คน ·
              เลือกนำเข้า {importCount} · เลือกนำออก {removeCount} · แสดง{" "}
              {filtered.length}/{users.length}
            </p>
          )}
        </>
      )}
    </Modal>
  );
}
