"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export function LoginForm() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const body = (await res.json()) as
        | { ok: true; data: { mustChangePassword: boolean } }
        | { ok: false; error: string };

      if (!body.ok) {
        setError(body.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      const target = body.data.mustChangePassword
        ? "/auth/change-password"
        : "/";
      window.location.assign(target);
    } catch {
      setError("เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card erp-panel border-0">
      <div className="card-body p-4">
        <h1 className="h4 erp-form-page-title mb-1">เข้าสู่ระบบ</h1>
        <p className="text-muted small mb-4">
          ใช้อีเมล ClickUp เป็นชื่อผู้ใช้
        </p>

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

        <Button type="submit" variant="success" className="w-100" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </div>
    </form>
  );
}
