"use client";

import { login } from "@/api/auth/login";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login({ username, password });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    if (res.data.mustChangePassword) {
      router.replace("/auth/change-password");
    } else {
      router.replace("/");
    }
    router.refresh();
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="รหัสผ่าน"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
