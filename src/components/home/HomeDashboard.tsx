"use client";

import { fetchHomeDashboard } from "@/api/home/fetch_dashboard";
import type { HomeDashboardRound } from "@/api/home/dashboard";
import type { HomeDashboardSummary } from "@/api/home/dashboard";
import { ErpAlert } from "@/components/erp";
import { buildFilterQuery } from "@/lib/build-filter-query";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import {
  formatRoundStatus,
  isRoundOpenForEval,
} from "@/lib/evaluation-round";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useCurrentUserStore } from "@/store/currentUserStore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

function esspets03DetailHref(templateId: string, employeeCode: string): string {
  return `/ess/esspets03${buildFilterQuery({
    templateId,
    employeeCode,
    viewerCode: employeeCode,
  })}`;
}

function groupRoundsByYear(
  rounds: HomeDashboardRound[],
): Array<[number, HomeDashboardRound[]]> {
  if (rounds.length === 0) return [];
  const map = new Map<number, HomeDashboardRound[]>();
  for (const round of rounds) {
    const list = map.get(round.evaluationYear) ?? [];
    list.push(round);
    map.set(round.evaluationYear, list);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

function RoundProgressCard({
  round,
  employeeCode,
}: {
  round: HomeDashboardRound;
  employeeCode: string;
}) {
  const selfPct = progressPercent(round.selfCompleted, round.selfTotal);
  const mgrPct = progressPercent(round.managerCompleted, round.managerTotal);
  const canSelfEval = isRoundOpenForEval(round.roundStatus);

  return (
    <div className="card erp-home-round-card h-100 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div>
            <h3 className="h6 mb-1">{round.roundName}</h3>
            <p className="small text-muted mb-0">
              ปี {round.evaluationYear}
              {round.evaluationPeriod
                ? ` · ${formatEvaluationPeriod(round.evaluationPeriod)}`
                : ""}
            </p>
          </div>
          <span className="badge text-bg-light text-dark border">
            {formatRoundStatus(round.roundStatus)}
          </span>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between small mb-1">
            <span>ประเมินตนเอง</span>
            <span className="fw-semibold">
              {round.selfCompleted}/{round.selfTotal} ({selfPct}%)
            </span>
          </div>
          <div className="progress erp-home-progress" style={{ height: 8 }}>
            <div
              className={`progress-bar ${
                round.selfStatus === "complete" ? "bg-success" : "bg-primary"
              }`}
              style={{ width: `${selfPct}%` }}
            />
          </div>
          <p className="small mb-0 mt-1">
            {round.selfStatus === "complete" ? (
              <span className="text-success">ประเมินตนเองครบแล้ว</span>
            ) : (
              <span className="text-warning">ยังประเมินตนเองไม่เสร็จ</span>
            )}
          </p>
        </div>

        {round.hasManagerEval ? (
          <div className="mb-3">
            <div className="d-flex justify-content-between small mb-1">
              <span>ผู้จัดการประเมินแล้ว</span>
              <span className="fw-semibold">
                {round.managerCompleted}/{round.managerTotal} ({mgrPct}%)
              </span>
            </div>
            <div className="progress erp-home-progress" style={{ height: 8 }}>
              <div
                className="progress-bar bg-info"
                style={{ width: `${mgrPct}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="small text-muted mb-3">ยังไม่มีผลประเมิน</p>
        )}

        <div className="d-flex flex-wrap gap-2">
          {canSelfEval ? (
            <Link
              href={`/ess/esspets02?templateId=${round.roundId}&share=1`}
              className="btn btn-success btn-sm"
            >
              ประเมินตนเอง
            </Link>
          ) : null}
          <Link
            href={esspets03DetailHref(round.roundId, employeeCode)}
            className="btn btn-outline-secondary btn-sm"
          >
            ดูผล
          </Link>
        </div>
      </div>
    </div>
  );
}

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; data: HomeDashboardSummary | null }
  | { kind: "error" };

type Props = {
  employeeCode?: string | null;
  employeeName?: string | null;
  initialData?: HomeDashboardSummary | null;
  loadError?: boolean;
};

export function HomeDashboard({
  employeeCode: serverEmployeeCode,
  employeeName: serverEmployeeName,
  initialData,
  loadError = false,
}: Props) {
  const hydrated = useStoreHydrated();
  const storeEmployeeCode = useCurrentUserStore((s) => s.employeeCode);
  const storeEmployeeName = useCurrentUserStore((s) => s.employeeName);
  const employeeCode = serverEmployeeCode ?? storeEmployeeCode;
  const employeeName = serverEmployeeName ?? storeEmployeeName;

  const serverLoaded = initialData !== undefined || loadError;

  const [loadState, setLoadState] = useState<LoadState>(() => {
    if (loadError) return { kind: "error" };
    if (initialData !== undefined) return { kind: "ready", data: initialData };
    return { kind: "idle" };
  });

  useEffect(() => {
    if (serverLoaded) return;
    if (!hydrated || !employeeCode) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoadState({ kind: "loading" });
    });

    fetchHomeDashboard(employeeCode)
      .then((result) => {
        if (!cancelled) {
          setLoadState({ kind: "ready", data: result });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState({ kind: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [employeeCode, hydrated, serverLoaded]);

  const rounds =
    loadState.kind === "ready" ? (loadState.data?.rounds ?? []) : [];
  const groupedByYear = useMemo(() => groupRoundsByYear(rounds), [rounds]);

  const loading =
    !serverLoaded &&
    (!hydrated || (Boolean(employeeCode) && loadState.kind === "loading"));

  if (loading) {
    return (
      <div className="erp-home-dashboard">
        <div className="placeholder-glow">
          <span className="placeholder col-8 mb-3 d-block" />
          <span className="placeholder col-12 mb-4 d-block" style={{ height: 120 }} />
          <div className="row g-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="col-md-4">
                <span className="placeholder w-100 d-block" style={{ height: 200 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!employeeCode) {
    return (
      <ErpAlert variant="warning">
        บัญชีนี้ยังไม่ผูกกับข้อมูลพนักงาน — ติดต่อผู้ดูแลระบบ
      </ErpAlert>
    );
  }

  if (loadState.kind === "error") {
    return (
      <ErpAlert variant="danger">
        ไม่สามารถโหลดแดชบอร์ดได้ — ลองรีเฟรชหน้าหรือติดต่อผู้ดูแลระบบ
      </ErpAlert>
    );
  }

  const data = loadState.kind === "ready" ? loadState.data : null;
  const displayName = data?.employeeName || employeeName || employeeCode;
  const summary = data ?? {
    totalRounds: 0,
    selfCompleteCount: 0,
    selfPendingCount: 0,
    rounds: [],
  };

  return (
    <div className="erp-home-dashboard">
      <header className="erp-home-hero rounded-4 p-4 p-md-5 mb-4 text-white">
        <p className="small text-white-50 mb-1">แดชบอร์ดผลการประเมิน</p>
        <h1 className="h3 mb-2">สวัสดี, {displayName}</h1>
        <p className="mb-0 opacity-75">
          สรุปความคืบหน้าการประเมินตนเองและผลจากผู้จัดการ แยกตามรอบและปี
        </p>
      </header>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted small mb-1">รอบประเมินทั้งหมด</p>
              <p className="display-6 fw-bold mb-0 text-primary">
                {summary.totalRounds}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted small mb-1">ประเมินตนเองครบแล้ว</p>
              <p className="display-6 fw-bold mb-0 text-success">
                {summary.selfCompleteCount}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted small mb-1">ยังประเมินไม่ครบ</p>
              <p className="display-6 fw-bold mb-0 text-warning">
                {summary.selfPendingCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link href="/ess/esspets01" className="btn btn-success btn-sm">
          ค้นหาแบบประเมิน
        </Link>
        <Link href="/ess/esspets03" className="btn btn-outline-success btn-sm">
          ดูสถานะผลประเมิน
        </Link>
      </div>

      {groupedByYear.length === 0 ? (
        <ErpAlert>
          ยังไม่มีรอบประเมินที่แสดงได้ — รอบเปิดประเมินจะแสดงเมื่อถึงวันเริ่ม
          หรือรอบที่คุณเคยทำประเมินแล้วจะแสดงแม้ปิดรอบ
        </ErpAlert>
      ) : (
        groupedByYear.map(([year, yearRounds]) => (
          <section key={year} className="mb-4">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <span className="erp-home-year-badge">{year}</span>
              <span className="text-muted fw-normal small">
                {yearRounds.length} รอบ
              </span>
            </h2>
            <div className="row g-3">
              {yearRounds.map((round) => (
                <div key={round.roundId} className="col-lg-6 col-xl-4">
                  <RoundProgressCard round={round} employeeCode={employeeCode} />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
