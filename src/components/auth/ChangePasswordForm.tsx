"use client";

import { changePassword } from "@/api/auth/change_password";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await changePassword({ newPassword, confirmPassword });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="card erp-panel border-0">
      <div className="card-body p-4">
        <h1 className="h4 erp-form-page-title mb-1">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-muted small mb-4">
          ผู้ดูแลระบบรีเซ็ตรหัสผ่านให้แล้ว กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งาน
        </p>

        {error && (
          <div className="alert alert-danger py-2 small">{error}</div>
        )}

        <div className="mb-3">
          <Input
            label="รหัสผ่านใหม่"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="ยืนยันรหัสผ่านใหม่"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" variant="success" className="w-100" disabled={loading}>
          {loading ? "กำลังบันทึก..." : "บันทึกและเข้าใช้งาน"}
        </Button>
      </div>
    </form>
  );
}
