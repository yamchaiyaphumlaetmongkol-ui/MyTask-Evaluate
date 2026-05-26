"use client";

import { useHasCurrentUser } from "@/hooks/useHasCurrentUser";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * ซิงก์พารามิเตอร์ ESS ให้สอดคล้องกับผู้ใช้ที่เลือก
 * — เปลี่ยนผู้ใช้ในแถบด้านซ้ายแล้ว URL จะอัปเดตตาม
 */
export function CurrentUserScopeGuard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { hydrated, hasUser, employeeCode } = useHasCurrentUser();

  useEffect(() => {
    if (!hydrated || !hasUser || !employeeCode) return;

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (pathname.startsWith("/ess/esspets02")) {
      if (params.get("share") === "1") return;

      const urlCode = params.get("employeeCode");
      if (urlCode && urlCode !== employeeCode) {
        params.set("employeeCode", employeeCode);
        changed = true;
      }
    }

    if (pathname.startsWith("/ess/esspets03")) {
      const viewer = params.get("viewerCode");
      if (!viewer || viewer !== employeeCode) {
        params.set("viewerCode", employeeCode);
        changed = true;
      }
      const subject = params.get("employeeCode");
      if (subject && subject !== employeeCode) {
        params.set("employeeCode", employeeCode);
        changed = true;
      }
    }

    if (pathname.startsWith("/ess/esspets04")) {
      const manager = params.get("managerCode");
      if (!manager || manager !== employeeCode) {
        const next = new URLSearchParams();
        next.set("managerCode", employeeCode);
        const templateId = params.get("templateId")?.trim();
        const subject = params.get("employeeCode")?.trim();
        if (templateId && subject) {
          next.set("templateId", templateId);
          next.set("employeeCode", subject);
        }
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        return;
      }
    }

    if (!changed) return;

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [
    pathname,
    searchParams,
    router,
    hydrated,
    hasUser,
    employeeCode,
  ]);

  return null;
}
