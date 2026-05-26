"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useState } from "react";

export type ErpPanelLevel = "head" | "sub";

export type ErpCollapsePanelProps = {
  title: ReactNode;
  level?: ErpPanelLevel;
  /** เปิดเมื่อโหลดครั้งแรก */
  defaultOpen?: boolean;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ErpCollapsePanel({
  title,
  level = "head",
  defaultOpen = true,
  badge,
  actions,
  children,
  className,
}: ErpCollapsePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn("erp-panel", `erp-panel--${level}`, className)}
      data-expanded={open}
    >
      <div className="erp-panel__header">
        <button
          type="button"
          className="erp-panel__toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <i
            className={cn(
              "bi erp-panel__chevron",
              open ? "bi-chevron-down" : "bi-chevron-right",
            )}
            aria-hidden
          />
          <span className="erp-panel__title">{title}</span>
          {badge}
        </button>
        {actions ? <div className="erp-panel__actions">{actions}</div> : null}
      </div>
      {open ? <div className="erp-panel__body">{children}</div> : null}
    </section>
  );
}
