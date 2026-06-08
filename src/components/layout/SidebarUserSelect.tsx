"use client";

import type { EmployeeOption } from "@/api/_shared/employee-options";
import { EmployeeAvatar } from "@/components/pm/EmployeeAvatar";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo } from "react";

type Props = {
  employees: EmployeeOption[];
};

function codeLabel(code: string | null) {
  return code ?? "ยังไม่มีรหัส";
}

export function SidebarUserSelect({ employees }: Props) {
  const hydrated = useStoreHydrated();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const employeeId = useCurrentUserStore((s) => s.employeeId);
  const employeeCode = useCurrentUserStore((s) => s.employeeCode);
  const employeeName = useCurrentUserStore((s) => s.employeeName);
  const profileImage = useCurrentUserStore((s) => s.profileImage);
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);

  const current = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId],
  );

  const displayName = current?.name ?? employeeName;
  const displayImage = current?.profileImage ?? profileImage;
  const displayCode = current?.code ?? employeeCode;

  useEffect(() => {
    if (!hydrated || employees.length === 0 || !employeeId) return;

    const match = employees.find((e) => e.id === employeeId);
    if (!match) return;

    if (
      match.code !== employeeCode ||
      match.name !== employeeName ||
      match.profileImage !== profileImage
    ) {
      setCurrentUser(match);
    }
  }, [
    hydrated,
    employees,
    employeeId,
    employeeCode,
    employeeName,
    profileImage,
    setCurrentUser,
  ]);

  if (!hydrated) {
    return (
      <div className="erp-sidebar-user">
        <div className="erp-sidebar-user-card erp-sidebar-user-card--loading">
          <span className="erp-emp-avatar erp-emp-avatar--placeholder erp-sidebar-user-card__avatar-skeleton" />
          {!collapsed && (
            <span className="profile-label text-white-50">กำลังโหลด...</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("erp-sidebar-user", collapsed && "erp-sidebar-user--collapsed")}>
        <Link
          href="/profile"
          className={cn(
            "erp-sidebar-user-card",
            "text-decoration-none",
            collapsed && "erp-sidebar-user-card--icon-only",
            employees.length === 0 && "erp-sidebar-user-card--empty",
          )}
          title={displayName || "โปรไฟล์ผู้ใช้"}
          aria-label="ไปหน้าโปรไฟล์ผู้ใช้"
        >
          <EmployeeAvatar
            src={displayImage}
            name={displayName || "?"}
            size={collapsed ? 40 : 44}
          />

          {!collapsed && (
            <>
              <span className="erp-sidebar-user-card__text min-w-0">
                <span className="erp-sidebar-user-card__name d-block text-truncate">
                  {displayName || "โปรไฟล์ผู้ใช้"}
                </span>
                <span className="erp-sidebar-user-card__code d-block text-truncate">
                  {displayCode ? displayCode : codeLabel(null)}
                </span>
              </span>
              <i
                className="bi bi-chevron-expand erp-sidebar-user-card__chevron flex-shrink-0"
                aria-hidden
              />
            </>
          )}
        </Link>
      </div>
    </>
  );
}
