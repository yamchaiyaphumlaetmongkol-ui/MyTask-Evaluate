"use client";

import Image from "next/image";
import Link from "next/link";
import { EvalNotificationBell } from "@/components/layout/EvalNotificationBell";
import { APP_CONFIG } from "@/lib/app-config";
import { useSidebarStore } from "@/store/sidebarStore";
export function AppHeader() {
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <>
      <div className="erp-top-accent" />
      <header className="erp-header d-flex align-items-center px-3 px-lg-4">
        <div className="d-flex align-items-center gap-3 flex-shrink-0">
          <button
            type="button"
            className="btn btn-link text-secondary p-0 border-0"
            aria-label={collapsed ? "เปิดเมนู" : "หุบเมนู"}
            onClick={toggleCollapsed}
          >
            <i className="bi bi-list fs-3" />
          </button>
          <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <Image
              src="/logo2.gif"
              alt={APP_CONFIG.title}
              width={44}
              height={44}
              className="erp-logo"
              priority
            />
            <div className="d-none d-sm-block">
              <div className="erp-brand-title">{APP_CONFIG.brandTitle}</div>
              <div className="erp-brand-sub">{APP_CONFIG.brandSub}</div>
            </div>
          </Link>
        </div>

        <div className="flex-grow-1 text-center d-none d-md-block">
          <span className="text-secondary small">{APP_CONFIG.tagline}</span>
        </div>

        <div className="d-flex align-items-center flex-shrink-0 ms-auto">
          <EvalNotificationBell />
          <Link href="/auth/signout" className="btn btn-dark btn-sm fw-bold">
            SIGN OUT
          </Link>
        </div>
      </header>
    </>
  );
}
