"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    formEl.reset();

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const body = (await res.json()) as
        | { ok: true }
        | { ok: false; error: string };

      if (!body.ok) {
        setError(body.error ?? "บันทึกไม่สำเร็จ");
        return;
      }

      window.location.assign("/");
    } catch {
      setError("บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
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
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="ยืนยันรหัสผ่านใหม่"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
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
