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
}

/** Bootstrap 5 modal — ใช้ data-bs-* เมื่อต้องการ modal แบบ imperative */
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size,
}: ModalProps) {
  if (!open) return null;

  const dialogClass = cn(
    "modal-dialog modal-dialog-centered",
    size === "sm" && "modal-sm",
    size === "lg" && "modal-lg",
    size === "xl" && "modal-xl",
  );

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className={dialogClass} role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}
