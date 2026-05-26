"use client";

import type { TemplateOption } from "@/api/ess/esspets02/types";
import { ErpPageIntro, ErpPageTitle } from "@/components/erp";
import { useHasCurrentUser } from "@/hooks/useHasCurrentUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  template: TemplateOption;
};

/** ลิงก์แชร์ — ใช้ผู้ใช้ที่เลือกตอนเข้าระบบแล้วเปิดแบบประเมินทันที */
export function SelfEvalShareGate({ template }: Props) {
  const router = useRouter();
  const { hydrated, hasUser, employeeCode } = useHasCurrentUser();

  useEffect(() => {
    if (!hydrated || !hasUser || !employeeCode) return;
    const params = new URLSearchParams({
      templateId: template.id,
      employeeCode,
    });
    router.replace(`/ess/esspets02?${params.toString()}`);
  }, [hydrated, hasUser, employeeCode, template.id, router]);

  return (
    <>
      <ErpPageTitle>ประเมินตนเอง</ErpPageTitle>
      <ErpPageIntro>
        แบบประเมิน: <span className="fw-semibold text-dark">{template.name}</span>
      </ErpPageIntro>
      <p className="text-muted mb-0">
        {!hydrated || hasUser
          ? "กำลังเปิดแบบประเมิน..."
          : "กรุณาเลือกผู้ใช้งานก่อนเริ่มประเมิน"}
      </p>
    </>
  );
}
