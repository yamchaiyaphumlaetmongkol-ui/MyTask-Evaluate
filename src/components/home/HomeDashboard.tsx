"use client";

import { fetchHomeDashboard } from "@/api/home/fetch_dashboard";
import type { HomeDashboardRound } from "@/api/home/dashboard";
import { ErpAlert } from "@/components/erp";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatRoundStatus } from "@/lib/evaluation-round";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useCurrentUserStore } from "@/store/currentUserStore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

function RoundProgressCard({ round }: { round: HomeDashboardRound }) {
  const selfPct = progressPercent(round.selfCompleted, round.selfTotal);
  const mgrPct = progressPercent(round.managerCompleted, round.managerTotal);

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
              <span>ผู้บังคับบัญชาประเมินแล้ว</span>
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
          <p className="small text-muted mb-3">ยังไม่มีผลจากผู้บังคับบัญชา</p>
        )}

        <div className="d-flex flex-wrap gap-2">
          <Link
            href={`/ess/esspets02?templateId=${round.roundId}&share=1`}
            className="btn btn-success btn-sm"
          >
            ประเมินตนเอง
          </Link>
          <Link
            href={`/ess/esspets03?templateId=${round.roundId}`}
            className="btn btn-outline-secondary btn-sm"
          >
            ดูผล
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HomeDashboard() {
  const hydrated = useStoreHydrated();
  const employeeCode = useCurrentUserStore((s) => s.employeeCode);
  const employeeName = useCurrentUserStore((s) => s.employeeName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchHomeDashboard>
  > | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!employeeCode) {
      setLoading(false);
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchHomeDashboard(employeeCode)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("ไม่สามารถโหลดแดชบอร์ดได้");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeCode, hydrated]);

  const groupedByYear = useMemo(() => {
    if (!data?.rounds.length) return [];
    const map = new Map<number, HomeDashboardRound[]>();
    for (const round of data.rounds) {
      const list = map.get(round.evaluationYear) ?? [];
      list.push(round);
      map.set(round.evaluationYear, list);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [data?.rounds]);

  if (!hydrated || loading) {
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
        กรุณาเลือกผู้ใช้งานที่แถบด้านซ้ายเพื่อดูแดชบอร์ดผลการประเมินของคุณ
      </ErpAlert>
    );
  }

  if (error) {
    return <ErpAlert>{error}</ErpAlert>;
  }

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
          สรุปความคืบหน้าการประเมินตนเองและผลจากผู้บังคับบัญชา แยกตามรอบและปี
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
        <Link href="/ess/esspets01" className="btn btn-primary btn-sm">
          ค้นหาแบบประเมิน
        </Link>
        <Link href="/ess/esspets03" className="btn btn-outline-primary btn-sm">
          ดูสถานะผลประเมิน
        </Link>
      </div>

      {groupedByYear.length === 0 ? (
        <ErpAlert>ยังไม่มีรอบประเมินในระบบ</ErpAlert>
      ) : (
        groupedByYear.map(([year, rounds]) => (
          <section key={year} className="mb-4">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <span className="erp-home-year-badge">{year}</span>
              <span className="text-muted fw-normal small">
                {rounds.length} รอบ
              </span>
            </h2>
            <div className="row g-3">
              {rounds.map((round) => (
                <div key={round.roundId} className="col-lg-6 col-xl-4">
                  <RoundProgressCard round={round} />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
