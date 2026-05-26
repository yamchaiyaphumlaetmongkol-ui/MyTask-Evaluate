"use client";

import type { MasterBlueprintRow } from "@/api/pe/pems01/types";
import { ClientTableFilterPanel } from "@/components/shared/ClientTableFilterPanel";
import { filterBySelectValue, uniqueSelectOptions } from "@/lib/filter-rows";
import { formatThaiDateTime } from "@/lib/format-datetime";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  rows: MasterBlueprintRow[];
};

export function Pems01MasterTable({ rows }: Props) {
  const [masterId, setMasterId] = useState("");

  const masterOptions = useMemo(
    () =>
      uniqueSelectOptions(rows.map((r) => r.id)).map((o) => {
        const row = rows.find((r) => r.id === o.value);
        return { value: o.value, label: row?.masterName ?? o.label };
      }),
    [rows],
  );

  const filtered = useMemo(
    () => filterBySelectValue(rows, masterId, (r) => r.id),
    [rows, masterId],
  );
  if (filtered.length === 0 && rows.length === 0) {
    return (
      <p className="text-muted text-center py-4 mb-0">
        ยังไม่มีแม่แบบ —{" "}
        <Link href="/pe/pems01/master/form">สร้างแม่แบบแรก</Link>
      </p>
    );
  }

  return (
    <>
      <ClientTableFilterPanel
        onClear={() => setMasterId("")}
        fields={[
          {
            kind: "select",
            id: "pems01-master",
            label: "ชื่อแม่แบบ",
            value: masterId,
            options: masterOptions,
            onChange: setMasterId,
          },
        ]}
      />
      {filtered.length === 0 ? (
        <p className="text-muted text-center py-4 mb-0">
          ไม่พบแม่แบบที่ตรงกับตัวกรอง
        </p>
      ) : null}
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead className="erp-table-head">
          <tr>
            <th className="text-center">ลำดับที่</th>
            <th>ชื่อแม่แบบ</th>
            <th className="text-center">หัวข้อหลัก</th>
            <th>วันที่สร้าง</th>
            <th className="text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, index) => (
            <tr key={row.id}>
              <td className="text-center">{index + 1}</td>
              <td>{row.masterName}</td>
              <td className="text-center">{row.headCount}</td>
              <td>{formatThaiDateTime(row.createdAt)}</td>
              <td className="text-center">
                <Link
                  href={`/pe/pems01/master/form?masterId=${encodeURIComponent(row.id)}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  แก้ไข / เปิดรอบ
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
