"use client";

import { getEvalNotifications } from "@/api/ess/get_eval_notifications";
import type { PendingEvalAlert } from "@/api/ess/_shared/pending-eval-alerts";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useNotificationDismissStore } from "@/store/notificationDismissStore";
import { useCurrentUserStore } from "@/store/currentUserStore";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export function EvalNotificationBell() {
  const hydrated = useStoreHydrated();
  const managerCode = useCurrentUserStore((s) => s.employeeCode);
  const dismissedIds = useNotificationDismissStore((s) => s.dismissedIds);
  const dismiss = useNotificationDismissStore((s) => s.dismiss);
  const [alerts, setAlerts] = useState<PendingEvalAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!managerCode) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await getEvalNotifications(managerCode);
      setAlerts(rows);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [managerCode]);

  useEffect(() => {
    if (!hydrated) return;
    refresh();
  }, [hydrated, refresh]);

  const visible = useMemo(
    () => alerts.filter((a) => !dismissedIds.includes(a.id)),
    [alerts, dismissedIds],
  );

  if (!hydrated || !managerCode) return null;

  return (
    <div className="dropdown me-2">
      <button
        type="button"
        className="btn btn-link text-secondary p-0 border-0 position-relative"
        aria-label="แจ้งเตือนการประเมิน"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) refresh();
        }}
      >
        <i className="bi bi-envelope fs-5" />
        {visible.length > 0 ? (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {visible.length > 9 ? "9+" : visible.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1040 }}
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="dropdown-menu show end-0 mt-2 p-0 shadow"
            style={{ width: "22rem", zIndex: 1050 }}
          >
            <div className="px-3 py-2 border-bottom">
              <span className="fw-semibold small">รอประเมินพนักงาน</span>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: "18rem", overflowY: "auto" }}>
              {loading ? (
                <p className="text-muted small text-center py-3 mb-0">
                  กำลังโหลด...
                </p>
              ) : visible.length === 0 ? (
                <p className="text-muted small text-center py-3 mb-0">
                  ไม่มีรายการรอประเมิน
                </p>
              ) : (
                visible.map((a) => (
                  <div key={a.id} className="list-group-item small">
                    <p className="mb-1 fw-semibold">{a.employeeName}</p>
                    <p className="mb-2 text-muted">{a.templateName}</p>
                    <p className="mb-2 text-muted">
                      ประเมินตนเองแล้ว {a.selfCompletedCount}/{a.subTotalCount} หัวข้อ
                    </p>
                    <div className="d-flex gap-2">
                      <Link
                        href={a.href}
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          dismiss(a.id);
                          setOpen(false);
                        }}
                      >
                        ไปประเมิน
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => dismiss(a.id)}
                      >
                        ปิด
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
