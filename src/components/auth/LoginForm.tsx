"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const from = searchParams.get("from") ?? "";

  useEffect(() => {
    try {
      localStorage.removeItem("erp-current-user");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <form action="/api/auth/login" method="POST" className="card erp-panel border-0">
      <div className="card-body p-4">
        <h1 className="h4 erp-form-page-title mb-1">เข้าสู่ระบบ</h1>
        <p className="text-muted small mb-4">
          ใช้อีเมล ClickUp เป็นชื่อผู้ใช้
        </p>

        {from && <input type="hidden" name="from" value={from} />}
        {error && (
          <div className="alert alert-danger py-2 small">{error}</div>
        )}

        <div className="mb-3">
          <Input
            label="ชื่อผู้ใช้"
            name="username"
            type="text"
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="รหัสผ่าน"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" variant="success" className="w-100">
          เข้าสู่ระบบ
        </Button>
      </div>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
