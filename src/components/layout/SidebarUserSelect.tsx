"use client";

import type { EmployeeOption } from "@/api/_shared/employee-options";
import { EmployeeAvatar } from "@/components/pm/EmployeeAvatar";
import { UserPickerModal } from "@/components/layout/UserPickerModal";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

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
  const [modalOpen, setModalOpen] = useState(false);

  const current = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId],
  );

  const displayName = current?.name ?? employeeName;
  const displayImage = current?.profileImage ?? profileImage;
  const displayCode = current?.code ?? employeeCode;

  useEffect(() => {
    if (!hydrated || employees.length === 0) return;

    if (employeeId) {
      const match = employees.find((e) => e.id === employeeId);
      if (match?.code) {
        if (match.code !== employeeCode) setCurrentUser(match);
        return;
      }
      useCurrentUserStore.getState().clearCurrentUser();
      return;
    }

    if (employeeCode) {
      const legacy = employees.find((e) => e.code === employeeCode);
      if (legacy?.code) {
        setCurrentUser(legacy);
        return;
      }
      useCurrentUserStore.getState().clearCurrentUser();
    }
  }, [hydrated, employees, employeeId, employeeCode, setCurrentUser]);

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

  const openPicker = () => {
    if (employees.length === 0) return;
    setModalOpen(true);
  };

  return (
    <>
      <div className={cn("erp-sidebar-user", collapsed && "erp-sidebar-user--collapsed")}>
        <button
          type="button"
          className={cn(
            "erp-sidebar-user-card",
            collapsed && "erp-sidebar-user-card--icon-only",
            employees.length === 0 && "erp-sidebar-user-card--empty",
          )}
          onClick={openPicker}
          disabled={employees.length === 0}
          title={displayName || "เลือกผู้ใช้งาน"}
          aria-label="เลือกผู้ใช้งาน"
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
                  {displayName || "เลือกผู้ใช้งาน"}
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
        </button>
      </div>

      <UserPickerModal
        open={modalOpen}
        employees={employees}
        selectedId={employeeId}
        onClose={() => setModalOpen(false)}
        onSelect={setCurrentUser}
      />
    </>
  );
}
