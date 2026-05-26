"use client";

import { useErpSearchPending } from "@/components/erp/ErpSearchPendingContext";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  clearHref?: string;
  onClear?: () => void;
  clearLabel?: string;
  submitDisabled?: boolean;
  submitLabel?: string;
  /** ซ่อนปุ่มค้นหา (เช่น ตัวกรอง client-side ที่มีแค่ล้าง) */
  showSubmit?: boolean;
};

/** ปุ่มค้นหา + ล้าง — กึ่งกลาง ล้างเป็น outline แสดงตลอด */
export function ErpSearchActions({
  clearHref,
  onClear,
  clearLabel = "ล้าง",
  submitDisabled = false,
  submitLabel = "ค้นหา",
  showSubmit = true,
}: Props) {
  const router = useRouter();
  const pending = useErpSearchPending();
  const [, startClearTransition] = useTransition();

  const canClear = Boolean(clearHref || onClear);

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }
    if (!clearHref) return;
    startClearTransition(() => {
      router.push(clearHref, { scroll: false });
    });
  };

  return (
    <div
      className={`erp-search-actions d-flex flex-nowrap${showSubmit ? "" : " erp-search-actions--clear-only"}`}
    >
      {showSubmit ? (
        <button
          type="submit"
          className="btn btn-success erp-search-actions__submit"
          disabled={submitDisabled || pending}
        >
          {pending ? "กำลังค้นหา…" : submitLabel}
        </button>
      ) : null}
      <button
        type="button"
        className="btn btn-outline-success erp-search-actions__clear"
        onClick={handleClear}
        disabled={pending || !canClear}
      >
        {clearLabel}
      </button>
    </div>
  );
}
