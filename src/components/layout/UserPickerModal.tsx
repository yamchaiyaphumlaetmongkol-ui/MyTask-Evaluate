"use client";

import type { EmployeeOption } from "@/api/_shared/employee-options";
import { EmployeeAvatar } from "@/components/pm/EmployeeAvatar";
import {
  SETUP_FORM_ID,
  UserPickerEmployeeSetupPanel,
} from "@/components/layout/user-picker/UserPickerEmployeeSetupPanel";
import { TableSearchBar } from "@/components/shared/TableSearchBar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { filterBySearch } from "@/lib/filter-rows";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  employees: EmployeeOption[];
  selectedId: string;
  onClose: () => void;
  onSelect: (employee: EmployeeOption) => void;
  /** ปิดไม่ได้จนกว่าจะยืนยัน — ใช้ตอนเข้าระบบครั้งแรก */
  required?: boolean;
  /** ต้องมีรหัสก่อนใช้งาน — บังคับกรอกในขั้นตอนถัดไป */
  requireCode?: boolean;
  description?: string;
};

type Step = "list" | "setup";

function employeeSubtitle(employee: EmployeeOption, step: Step) {
  if (employee.code) return employee.code;
  return step === "list"
    ? "ยังไม่มีรหัส — กดยืนยันเพื่อกรอกข้อมูล"
    : "ยังไม่มีรหัสพนักงาน";
}

export function UserPickerModal({
  open,
  employees: employeesProp,
  selectedId,
  onClose,
  onSelect,
  required = false,
  requireCode = false,
  description,
}: Props) {
  const [step, setStep] = useState<Step>("list");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState(selectedId);
  const [employees, setEmployees] = useState(employeesProp);
  const [savingSetup, setSavingSetup] = useState(false);

  useEffect(() => {
    setEmployees(employeesProp);
  }, [employeesProp]);

  useEffect(() => {
    if (!open) return;
    setStep("list");
    setPendingId(selectedId);
    setSearch("");
    setSavingSetup(false);
  }, [open, selectedId]);

  const filtered = useMemo(
    () =>
      filterBySearch(employees, search, (e) =>
        [e.name, e.code, e.id].filter(Boolean).join(" "),
      ),
    [employees, search],
  );

  const pending = useMemo(
    () => employees.find((e) => e.id === pendingId) ?? null,
    [employees, pendingId],
  );

  const mustCompleteSetup = Boolean(
    requireCode && pending && !pending.code,
  );

  const handleConfirm = () => {
    if (!pending) return;
    if (!pending.code) {
      setStep("setup");
      return;
    }
    onSelect(pending);
    if (!required) onClose();
  };

  const handleSetupSuccess = (employee: EmployeeOption) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? employee : e)),
    );
    onSelect(employee);
    if (!required) onClose();
  };

  const handleClose = () => {
    if (required || savingSetup) return;
    onClose();
  };

  const handleBackToList = () => {
    if (savingSetup) return;
    setStep("list");
  };

  const modalTitle =
    step === "setup" ? "กรอกข้อมูลพนักงาน" : "เลือกผู้ใช้งาน";

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={handleClose}
      scrollable
      closable={!required && !savingSetup && step === "list"}
      dialogClassName={cn(
        "erp-user-picker-modal",
        step === "setup" && "erp-user-picker-modal--with-setup",
      )}
      bodyClassName="erp-user-picker-modal__body d-flex flex-column"
      footer={
        <div className="w-100 d-flex flex-wrap gap-2 justify-content-end">
          {step === "setup" ? (
            <Button
              variant="outline-secondary"
              disabled={savingSetup}
              onClick={handleBackToList}
            >
              เลือกคนอื่น
            </Button>
          ) : !required ? (
            <Button
              variant="outline-secondary"
              disabled={savingSetup}
              onClick={handleClose}
            >
              ยกเลิก
            </Button>
          ) : null}
          {step === "setup" ? (
            <Button
              variant="success"
              type="submit"
              form={SETUP_FORM_ID}
              disabled={savingSetup}
            >
              {savingSetup ? "กำลังบันทึก..." : "บันทึกและยืนยันการเลือก"}
            </Button>
          ) : (
            <Button
              variant="success"
              disabled={!pending}
              onClick={handleConfirm}
            >
              ยืนยันการเลือก
            </Button>
          )}
        </div>
      }
    >
      {step === "list" ? (
        <>
          {description ? (
            <p className="text-muted small mb-3">{description}</p>
          ) : null}

          <TableSearchBar
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
          />

          {employees.length === 0 ? (
            <p className="text-muted text-center py-4 mb-0">
              ยังไม่มีพนักงานในระบบ — เพิ่มจาก PMMS01
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-muted text-center py-4 mb-0">
              ไม่พบรายการที่ตรงกับ &quot;{search}&quot;
            </p>
          ) : (
            <ul className="list-unstyled erp-user-picker-list mb-0 flex-grow-1">
              {filtered.map((employee) => {
                const isPending = employee.id === pendingId;
                const isCurrent = employee.id === selectedId;
                const missingCode = !employee.code;

                return (
                  <li key={employee.id}>
                    <button
                      type="button"
                      className={cn(
                        "erp-user-picker-item w-100",
                        isPending && "erp-user-picker-item--pending",
                        isCurrent &&
                          !isPending &&
                          "erp-user-picker-item--current",
                      )}
                      onClick={() => setPendingId(employee.id)}
                    >
                      <EmployeeAvatar
                        src={employee.profileImage}
                        name={employee.name}
                        size={48}
                      />
                      <span className="erp-user-picker-item__text min-w-0">
                        <span className="erp-user-picker-item__name d-block">
                          {employee.name}
                        </span>
                        <span className="erp-user-picker-item__code small text-muted">
                          {employeeSubtitle(employee, step)}
                        </span>
                      </span>
                      {missingCode ? (
                        <span className="badge rounded-pill text-bg-warning erp-user-picker-item__badge flex-shrink-0">
                          รอกรอกข้อมูล
                        </span>
                      ) : null}
                      {isPending ? (
                        <i
                          className="bi bi-check-circle-fill text-erp-primary flex-shrink-0"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : pending ? (
        <>
          <div className="erp-user-picker-setup-selected d-flex align-items-center gap-2 mb-3">
            <EmployeeAvatar
              src={pending.profileImage}
              name={pending.name}
              size={44}
            />
            <div className="min-w-0">
              <p className="fw-semibold text-erp-primary mb-0">{pending.name}</p>
              <p className="text-muted small mb-0">
                กรอกรหัสและข้อมูลให้ครบแล้วกดบันทึก
                {mustCompleteSetup ? " (จำเป็นก่อนใช้งาน)" : ""}
              </p>
            </div>
          </div>
          <UserPickerEmployeeSetupPanel
            employeeId={pending.id}
            onSuccess={handleSetupSuccess}
            onSavingChange={setSavingSetup}
          />
        </>
      ) : null}
    </Modal>
  );
}
