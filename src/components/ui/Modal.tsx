"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "lg" | "xl";
  /** Bootstrap modal-dialog-scrollable — เนื้อหาใน modal-body เลื่อนได้เมื่อสูงเกินจอ */
  scrollable?: boolean;
  /** ซ่อนปุ่มปิดและไม่ให้คลิก backdrop ปิด (ใช้กับ modal บังคับเลือก) */
  closable?: boolean;
  dialogClassName?: string;
  bodyClassName?: string;
}

/** Bootstrap 5 modal — ใช้ data-bs-* เมื่อต้องการ modal แบบ imperative */
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size,
  scrollable,
  closable = true,
  dialogClassName,
  bodyClassName,
}: ModalProps) {
  if (!open) return null;

  const dialogClass = cn(
    "modal-dialog modal-dialog-centered",
    scrollable && "modal-dialog-scrollable",
    size === "sm" && "modal-sm",
    size === "lg" && "modal-lg",
    size === "xl" && "modal-xl",
    dialogClassName,
  );

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className={dialogClass} role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              {closable ? (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onClose}
                />
              ) : null}
            </div>
            <div className={cn("modal-body px-4 py-3", bodyClassName)}>
              {children}
            </div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div
        className="modal-backdrop fade show"
        onClick={closable ? onClose : undefined}
      />
    </>
  );
}
