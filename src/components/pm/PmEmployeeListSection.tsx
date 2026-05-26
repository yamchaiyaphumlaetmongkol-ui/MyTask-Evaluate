"use client";

import { deleteEmployee } from "@/api/pm/pmms01/save_emp";
import type { EmployeeRow } from "@/api/pm/pmms01/types";
import { ClickUpImportModal } from "@/components/pm/ClickUpImportModal";
import { PmEmployeeTable } from "@/components/pm/PmEmployeeTable";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  rows: EmployeeRow[];
};

export function PmEmployeeListSection({ rows }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`ลบพนักงาน ${label}?`)) return;
    setDeletingId(id);
    setError(null);
    const res = await deleteEmployee(id);
    setDeletingId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 mb-0 erp-form-page-title">รายชื่อพนักงาน</h1>
        <Button variant="success" onClick={() => setModalOpen(true)}>
          จัดการจาก ClickUp
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small">{error}</div>
      )}

      <PmEmployeeTable
        rows={rows}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <ClickUpImportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
