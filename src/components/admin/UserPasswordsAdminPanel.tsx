"use client";

import type { AuthUserAdminRow } from "@/api/auth/_queries";
import { adminResetUserPassword } from "@/api/auth/admin_reset_password";
import { adminSetUserPassword } from "@/api/auth/admin_set_user_password";
import {
  ErpAlert,
  ErpDataTable,
  ErpField,
  ErpPageIntro,
  ErpPageTitle,
  ErpPanel,
} from "@/components/erp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DEFAULT_USER_PASSWORD } from "@/lib/auth/constants";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  rows: AuthUserAdminRow[];
};

export function UserPasswordsAdminPanel({ rows }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyAuthId, setBusyAuthId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<AuthUserAdminRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      [
        row.username,
        row.employeeName ?? "",
        row.employeeCode ?? "",
        row.role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [rows, search]);

  const openEdit = (row: AuthUserAdminRow) => {
    setEditRow(row);
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setEditOpen(true);
  };

  const handleReset = async (row: AuthUserAdminRow) => {
    if (row.role === "admin") return;
    if (
      !confirm(
        `รีเซ็ตรหัสผ่านของ ${row.username} เป็น ${DEFAULT_USER_PASSWORD}?`,
      )
    ) {
      return;
    }
    setBusyAuthId(row.authId);
    setError(null);
    setSuccess(null);
    const res = await adminResetUserPassword({ authId: row.authId });
    setBusyAuthId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess(
      `รีเซ็ตสำเร็จ — ${res.data.username} ใช้ ${DEFAULT_USER_PASSWORD} login แล้วต้องตั้งรหัสใหม่`,
    );
    router.refresh();
  };

  const handleSetPassword = async () => {
    if (!editRow) return;
    if (newPassword.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setBusyAuthId(editRow.authId);
    setError(null);
    const res = await adminSetUserPassword({
      authId: editRow.authId,
      newPassword,
    });
    setBusyAuthId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEditOpen(false);
    setSuccess(`ตั้งรหัสผ่านสำเร็จ — ${res.data.username}`);
    router.refresh();
  };

  return (
    <>
      <ErpPageTitle>จัดการรหัสผ่านผู้ใช้</ErpPageTitle>
      <ErpPageIntro>
        เฉพาะผู้ดูแลระบบ — รีเซ็ตเมื่อผู้ใช้ลืมรหัสผ่าน (ผู้ใช้ต้องตั้งรหัสใหม่ครั้งถัดไปที่ login)
        หรือตั้งรหัสผ่านให้โดยตรง
      </ErpPageIntro>

      {error && !editOpen ? <ErpAlert variant="danger">{error}</ErpAlert> : null}
      {success ? <ErpAlert variant="success">{success}</ErpAlert> : null}

      <ErpPanel className="mb-3">
        <ErpField label="ค้นหา">
          <Input
            name="user-password-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ชื่อผู้ใช้ / พนักงาน / รหัสพนักงาน"
          />
        </ErpField>
      </ErpPanel>

      <ErpDataTable
        showIndex
        data={filtered}
        rowKey={(row) => row.authId}
        emptyMessage="ไม่พบบัญชีผู้ใช้"
        columns={[
          {
            key: "username",
            header: "ชื่อผู้ใช้",
            render: (row) => row.username,
          },
          {
            key: "role",
            header: "บทบาท",
            render: (row) =>
              row.role === "admin" ? (
                <span className="badge text-bg-secondary">admin</span>
              ) : (
                <span className="badge text-bg-light border">user</span>
              ),
          },
          {
            key: "employee",
            header: "พนักงาน",
            render: (row) =>
              row.employeeName ? (
                <>
                  {row.employeeName}
                  {row.employeeCode ? (
                    <span className="text-muted small ms-1">
                      ({row.employeeCode})
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-muted">—</span>
              ),
          },
          {
            key: "actions",
            header: "จัดการ",
            className: "text-end",
            headerClassName: "text-end",
            render: (row) => (
              <div className="d-flex gap-1 justify-content-end flex-wrap">
                <Button
                  variant="primary"
                  className="btn-sm"
                  disabled={busyAuthId === row.authId}
                  onClick={() => openEdit(row)}
                >
                  ตั้งรหัสผ่าน
                </Button>
                {row.role !== "admin" ? (
                  <Button
                    variant="outline-secondary"
                    className="btn-sm"
                    disabled={busyAuthId === row.authId}
                    onClick={() => handleReset(row)}
                  >
                    รีเซ็ตเป็น {DEFAULT_USER_PASSWORD}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={editOpen}
        title={editRow ? `ตั้งรหัสผ่าน — ${editRow.username}` : "ตั้งรหัสผ่าน"}
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="outline-secondary" onClick={() => setEditOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              variant="success"
              disabled={!editRow || busyAuthId === editRow.authId}
              onClick={handleSetPassword}
            >
              {busyAuthId === editRow?.authId ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </>
        }
      >
        {error && editOpen ? (
          <div className="alert alert-danger py-2 small">{error}</div>
        ) : null}
        <div className="mb-3">
          <Input
            label="รหัสผ่านใหม่"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Input
          label="ยืนยันรหัสผ่านใหม่"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Modal>
    </>
  );
}
