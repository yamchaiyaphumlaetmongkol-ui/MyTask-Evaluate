"use client";

import type { EmployeeRow } from "@/api/pm/pmms01/types";
import { EmployeeAvatar } from "@/components/pm/EmployeeAvatar";
import { ClientTableFilterPanel } from "@/components/shared/ClientTableFilterPanel";
import { filterBySearch, filterBySelectValue } from "@/lib/filter-rows";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  rows: EmployeeRow[];
  onDelete: (id: string, label: string) => void;
  deletingId: string | null;
};

export function PmEmployeeTable({ rows, onDelete, deletingId }: Props) {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [positionCode, setPositionCode] = useState("");

  const roleOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      const code = r.roleCode?.trim();
      if (!code) continue;
      const name = r.roleName?.trim();
      map.set(code, name ? `${code} — ${name}` : code);
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "th"));
  }, [rows]);

  const positionOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      const code = r.positionCode?.trim();
      if (!code) continue;
      const name = r.positionName?.trim();
      map.set(code, name ? `${code} — ${name}` : code);
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "th"));
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    list = filterBySearch(
      list,
      employeeSearch,
      (r) =>
        `${r.displayName} ${r.employeeCode ?? ""} ${r.clickupUsername ?? ""}`,
    );
    list = filterBySelectValue(list, roleCode, (r) => r.roleCode ?? "");
    list = filterBySelectValue(list, positionCode, (r) => r.positionCode ?? "");
    return list;
  }, [rows, employeeSearch, roleCode, positionCode]);

  return (
    <>
      <ClientTableFilterPanel
        onClear={() => {
          setEmployeeSearch("");
          setRoleCode("");
          setPositionCode("");
        }}
        fields={[
          {
            id: "pm-emp-search",
            label: "พนักงาน",
            value: employeeSearch,
            onChange: setEmployeeSearch,
            placeholder: "ชื่อหรือรหัสพนักงาน...",
          },
          {
            kind: "select",
            id: "pm-emp-role",
            label: "Role",
            value: roleCode,
            options: roleOptions,
            onChange: setRoleCode,
          },
          {
            kind: "select",
            id: "pm-emp-position",
            label: "ตำแหน่ง",
            value: positionCode,
            options: positionOptions,
            onChange: setPositionCode,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <p className="text-muted text-center py-4 mb-0">
          {rows.length === 0
            ? "ยังไม่มีพนักงาน — กดเพิ่มจาก ClickUp"
            : "ไม่พบรายการที่ตรงคำค้นหา"}
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="erp-table-head">
              <tr>
                <th className="text-center" style={{ width: "4rem" }}>
                  ลำดับ
                </th>
                <th>ชื่อเต็ม</th>
                <th>รหัสพนักงาน</th>
                <th>role</th>
                <th>position</th>
                <th className="text-center">แก้ไข</th>
                <th className="text-center">ลบ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id}>
                  <td className="text-center">{i + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <EmployeeAvatar
                        src={row.clickupProfileImage}
                        name={row.displayName}
                      />
                      <span>{row.displayName}</span>
                    </div>
                  </td>
                  <td>{row.employeeCode || "—"}</td>
                  <td>{row.roleName ?? row.roleCode ?? "—"}</td>
                  <td>{row.positionName ?? row.positionCode ?? "—"}</td>
                  <td className="text-center">
                    <Link
                      href={`/pm/pmms01/edit?id=${encodeURIComponent(row.id)}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      แก้ไข
                    </Link>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === row.id}
                      onClick={() =>
                        onDelete(row.id, row.employeeCode ?? row.displayName)
                      }
                    >
                      {deletingId === row.id ? "..." : "ลบ"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
