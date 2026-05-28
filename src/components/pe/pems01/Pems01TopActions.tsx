"use client";

import type { RoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { Pems01ExcelImportModal } from "@/components/pe/pems01/Pems01ExcelImportModal";
import { useState } from "react";
import Link from "next/link";

type Props = {
  filterOptions: RoundListFilterOptions;
};

export function Pems01TopActions({ filterOptions }: Props) {
  const [open, setOpen] = useState(false);
  const [modalSeed, setModalSeed] = useState(0);
  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        <Link href="/pe/pems01/form" className="btn btn-outline-success btn-lg">
          + สร้างรอบประเมิน
        </Link>
        <button
          type="button"
          className="btn btn-success btn-lg"
          onClick={() => {
            setModalSeed((s) => s + 1);
            setOpen(true);
          }}
        >
          Upload Excel
        </button>
      </div>
      <Pems01ExcelImportModal
        key={modalSeed}
        open={open}
        onClose={() => setOpen(false)}
        roundOptions={filterOptions.rounds}
      />
    </>
  );
}
