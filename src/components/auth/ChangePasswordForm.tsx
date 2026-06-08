"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChangePasswordFormInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <form
      action="/api/auth/change-password"
      method="POST"
      className="card erp-panel border-0"
    >
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

        <Button type="submit" variant="success" className="w-100">
          บันทึกและเข้าใช้งาน
        </Button>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  return (
    <Suspense fallback={null}>
      <ChangePasswordFormInner />
    </Suspense>
  );
}
