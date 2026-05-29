"use client";

import { importEvaluationTemplateExcel } from "@/api/pe/pems01/import_template_excel";
import { parseEvaluationTemplateExcelAction } from "@/api/pe/pems01/parse_template_excel";
import type { RoundFilterOption } from "@/api/_shared/round-filter-options";
import type { ParsedStructure } from "@/lib/excel/parse-evaluation-template";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EVALUATION_PERIODS } from "@/lib/evaluation-period";
import { EVA_TEMPLATE_PUBLIC_URL } from "@/lib/excel/eva-template-public";
import { stripYearFromRoundName } from "@/lib/round-name";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  roundOptions: RoundFilterOption[];
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function fileToBase64(file: File): Promise<string> {
  const arr = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arr);
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function Pems01ExcelImportModal({ open, onClose, roundOptions }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"H1" | "H2">("H1");
  const [importMode, setImportMode] = useState<"create" | "update">("create");
  const [roundId, setRoundId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [evaluationYear, setEvaluationYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [structure, setStructure] = useState<ParsedStructure | null>(null);
  const [diagnostics, setDiagnostics] = useState<
    Array<{ sheet: string; row: number | null; col: string | null; message: string; severity: string }>
  >([]);
  const [questions, setQuestions] = useState<
    Array<{ id: string; prompt: string; choices: Array<{ id: string; label: string }> }>
  >([]);
  const [sheetOptions, setSheetOptions] = useState<string[]>([]);
  const [yearFromDocumentNote, setYearFromDocumentNote] = useState<string | null>(
    null,
  );

  const canImport =
    Boolean(structure) &&
    templateName.trim().length > 0 &&
    startDate.trim().length > 0 &&
    endDate.trim().length > 0 &&
    (importMode === "create" || roundId) &&
    Number.isFinite(Number(evaluationYear)) &&
    Number(evaluationYear) >= 2000 &&
    !diagnostics.some((d) => d.severity === "error");

  const preview = useMemo(() => {
    if (!structure) return null;
    const headCount = structure.heads.length;
    const subCount = structure.heads.reduce((sum, h) => sum + h.subs.length, 0);
    const criteriaCount = structure.heads.reduce(
      (sum, h) => sum + h.subs.reduce((s, sub) => s + sub.details.length, 0),
      0,
    );
    const proportionTotal = structure.heads.reduce((sum, h) => sum + h.proportion, 0);
    return { headCount, subCount, criteriaCount, proportionTotal };
  }, [structure]);

  const handleParse = async () => {
    if (!file) {
      setError("กรุณาเลือกไฟล์ Excel ก่อน");
      return;
    }
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError("รองรับเฉพาะไฟล์ .xlsx/.xls");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("ไฟล์ใหญ่เกินกำหนด (สูงสุด 10MB)");
      return;
    }

    setLoading(true);
    setError(null);
    setStructure(null);
    const fileBase64 = await fileToBase64(file);
    const res = await parseEvaluationTemplateExcelAction({
      fileBase64,
      selectedSheet: selectedSheet || undefined,
      selectedPeriod,
      enforceHeadProportion100: true,
    });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setDiagnostics(res.data.diagnostics);
    setSheetOptions(res.data.sheetOptions);
    setQuestions(
      res.data.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices.map((c) => ({ id: c.id, label: c.label })),
      })),
    );

    if (res.data.questions.some((q) => q.id === "sheet")) {
      return;
    }

    if (res.data.success) {
      setStructure(res.data.structure);
      const suggestedYear = res.data.structure.suggestedYear;
      if (!templateName.trim() && res.data.structure.suggestedName) {
        const rawName = res.data.structure.suggestedName;
        if (suggestedYear) {
          setTemplateName(stripYearFromRoundName(rawName, suggestedYear));
        } else {
          setTemplateName(rawName);
        }
      }
      if (suggestedYear) {
        setEvaluationYear(String(suggestedYear));
        setYearFromDocumentNote(res.data.structure.suggestedYearNote ?? null);
      } else {
        setYearFromDocumentNote(null);
      }
    }
  };

  const handleImport = async () => {
    if (!structure) return;
    setSaving(true);
    setError(null);
    const res = await importEvaluationTemplateExcel({
      structure,
      templateName: templateName.trim(),
      evaluationYear: Number(evaluationYear),
      evaluationPeriod: selectedPeriod,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      importMode,
      roundId: importMode === "update" ? roundId : undefined,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <Modal
      open={open}
      title="นำเข้า Excel — สร้างแบบประเมิน (เฉพาะโครงสร้าง)"
      onClose={onClose}
      size="xl"
      scrollable
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading || saving}>
            ยกเลิก
          </Button>
          <Button variant="outline-primary" onClick={handleParse} disabled={loading || saving}>
            {loading ? "กำลังตรวจไฟล์..." : "ตรวจไฟล์ / ดูตัวอย่าง"}
          </Button>
          <Button variant="success" onClick={handleImport} disabled={!canImport || saving}>
            {saving ? "กำลังนำเข้า..." : "ยืนยันนำเข้า"}
          </Button>
        </>
      }
    >
      <p className="mb-3">
        <a
          href={EVA_TEMPLATE_PUBLIC_URL}
          download
          className="btn btn-outline-secondary btn-sm"
        >
          ดาวน์โหลด Template
        </a>
      </p>

      <div className="mb-3">
        <label className="form-label">ไฟล์ Excel</label>
        <input
          type="file"
          className="form-control"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">ชีต</label>
          <select
            className="form-select"
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
          >
            <option value="">เลือกอัตโนมัติ (sheet แรก)</option>
            {sheetOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">ช่วงประเมิน</label>
          <select
            className="form-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "H1" | "H2")}
          >
            {EVALUATION_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">โหมดนำเข้า</label>
        <div className="d-flex flex-wrap gap-3">
          <label className="form-check">
            <input
              type="radio"
              className="form-check-input"
              checked={importMode === "create"}
              onChange={() => setImportMode("create")}
            />
            <span className="form-check-label">สร้างแบบประเมินใหม่</span>
          </label>
          <label className="form-check">
            <input
              type="radio"
              className="form-check-input"
              checked={importMode === "update"}
              onChange={() => setImportMode("update")}
            />
            <span className="form-check-label">อัปเดตรอบเดิม (ยังไม่มีผลประเมิน)</span>
          </label>
        </div>
      </div>

      {importMode === "update" && (
        <div className="mb-3">
          <label className="form-label">รอบที่ต้องการอัปเดต</label>
          <select
            className="form-select"
            value={roundId}
            onChange={(e) => setRoundId(e.target.value)}
          >
            <option value="">— เลือกรอบ —</option>
            {roundOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="border rounded p-3 mb-3">
        <h6 className="mb-3">ข้อมูลแบบประเมิน (ตั้งชื่อเอง)</h6>
        <Input
          label="ชื่อแบบประเมิน / รอบ"
          name="templateName"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="เช่น แบบประเมินผลงาน 2025 ครึ่งหลัง"
        />
        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <Input
              type="number"
              label="ปีประเมิน (ค.ศ.)"
              name="evaluationYear"
              value={evaluationYear}
              onChange={(e) => {
                setEvaluationYear(e.target.value);
                setYearFromDocumentNote(null);
              }}
            />
            {yearFromDocumentNote ? (
              <div className="alert alert-info py-2 small mt-2 mb-0">
                <strong>อ่านจากเอกสาร:</strong> {yearFromDocumentNote}
                <br />
                แก้ไขช่องปีด้านบนได้หากไม่ตรงความต้องการ
              </div>
            ) : structure && !structure.suggestedYear ? (
              <p className="text-muted small mt-1 mb-0">
                ไม่พบปีในเอกสาร — กรุณากำหนดปีเอง
              </p>
            ) : null}
          </div>
          <div className="col-md-4">
            <Input
              type="date"
              label="วันเริ่ม"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <Input
              type="date"
              label="วันสิ้นสุด"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {questions.length > 0 && (
        <div className="alert alert-warning py-2">
          {questions.map((q) => (
            <div key={q.id} className="mb-2">
              <div className="fw-semibold">{q.prompt}</div>
              <div className="small">
                {q.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="btn btn-sm btn-outline-secondary me-1 mt-1"
                    onClick={() => {
                      if (q.id === "sheet") setSelectedSheet(c.id);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && structure && (
        <div className="border rounded p-3 mb-3 bg-light-subtle">
          <div className="fw-semibold mb-1">ตัวอย่างโครงสร้าง</div>
          <div className="small text-muted mb-2">
            ปี {evaluationYear} · หัวข้อหลัก: {preview.headCount} · หัวข้อย่อย: {preview.subCount} · เกณฑ์:{" "}
            {preview.criteriaCount} · สัดส่วนรวม: {preview.proportionTotal.toFixed(2)}%
          </div>
          <ul className="small mb-0">
            {structure.heads.map((h) => (
              <li key={h.headTopic}>
                {h.headTopic} ({h.proportion}%) — {h.subs.length} หัวข้อย่อย
              </li>
            ))}
          </ul>
        </div>
      )}

      {diagnostics.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>ระดับ</th>
                <th>ชีต</th>
                <th>แถว</th>
                <th>คอลัมน์</th>
                <th>ข้อความ</th>
              </tr>
            </thead>
            <tbody>
              {diagnostics.map((d, idx) => (
                <tr key={`${idx}-${d.message}`}>
                  <td>{d.severity}</td>
                  <td>{d.sheet}</td>
                  <td>{d.row ?? "-"}</td>
                  <td>{d.col ?? "-"}</td>
                  <td>{d.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
