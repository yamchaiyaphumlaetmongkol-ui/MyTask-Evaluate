-- =============================================================================
-- อัปเกรดทีหลัง: แยกผลประเมิน (self/manager) ออกจาก pe_evaluation_detail
--            → ตาราง pe_evaluation_detail_result
--
-- วิธีรัน:
--   psql "$DATABASE_URL" -f script/sql/06_upgrade_pe_detail_result.sql
--
-- หมายเหตุ: ข้อมูลเก่าที่ไม่มี employee_code จะไม่ถูกย้ายอัตโนมัติ
--           (ใช้ created_by เป็นผู้ถูกประเมินเมื่อมีค่าเท่านั้น)
-- =============================================================================

-- 1) ตารางผลประเมิน
CREATE TABLE IF NOT EXISTS pe_evaluation_detail_result (
    id                      BIGSERIAL PRIMARY KEY,
    pe_evaluation_detail    BIGINT       NOT NULL,
    employee_code           VARCHAR(50)  NOT NULL,
    evaluator_type          VARCHAR(20)  NOT NULL,
    evaluator_employee_code VARCHAR(50),
    score                   NUMERIC(8, 2),
    result_detail           TEXT,
    created_date            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_detail_result_detail_fk
        FOREIGN KEY (pe_evaluation_detail) REFERENCES pe_evaluation_detail (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pe_evaluation_detail_result_employee_fk
        FOREIGN KEY (employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_detail_result_evaluator_fk
        FOREIGN KEY (evaluator_employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT pe_evaluation_detail_result_unique_uq
        UNIQUE (pe_evaluation_detail, employee_code, evaluator_type)
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_detail_result_detail
    ON pe_evaluation_detail_result (pe_evaluation_detail);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_detail_result_employee
    ON pe_evaluation_detail_result (employee_code);

-- 2) trigger updated_date
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_date') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_pe_evaluation_detail_result_updated_date ON pe_evaluation_detail_result';
        EXECUTE '
            CREATE TRIGGER trg_pe_evaluation_detail_result_updated_date
                BEFORE UPDATE ON pe_evaluation_detail_result
                FOR EACH ROW EXECUTE PROCEDURE set_updated_date()';
    END IF;
END $$;

-- 3) ย้ายข้อมูลเก่า (เมื่อมี created_by = รหัสพนักงานใน pm_employee)
INSERT INTO pe_evaluation_detail_result (
    pe_evaluation_detail,
    employee_code,
    evaluator_type,
    evaluator_employee_code,
    score,
    result_detail,
    created_date,
    updated_date
)
SELECT
    d.id,
    d.created_by,
    'self',
    d.created_by,
    d.self_score,
    d.self_detail,
    d.created_date,
    d.updated_date
FROM pe_evaluation_detail d
WHERE (
        d.self_score IS NOT NULL
        OR (d.self_detail IS NOT NULL AND TRIM(d.self_detail) <> '')
    )
  AND d.created_by IS NOT NULL
  AND EXISTS (SELECT 1 FROM pm_employee e WHERE e.employee_code = d.created_by)
ON CONFLICT (pe_evaluation_detail, employee_code, evaluator_type) DO NOTHING;

INSERT INTO pe_evaluation_detail_result (
    pe_evaluation_detail,
    employee_code,
    evaluator_type,
    evaluator_employee_code,
    score,
    result_detail,
    created_date,
    updated_date
)
SELECT
    d.id,
    d.created_by,
    'manager',
    NULL,
    d.manager_score,
    d.manager_detail,
    d.created_date,
    d.updated_date
FROM pe_evaluation_detail d
WHERE (
        d.manager_score IS NOT NULL
        OR (d.manager_detail IS NOT NULL AND TRIM(d.manager_detail) <> '')
    )
  AND d.created_by IS NOT NULL
  AND EXISTS (SELECT 1 FROM pm_employee e WHERE e.employee_code = d.created_by)
ON CONFLICT (pe_evaluation_detail, employee_code, evaluator_type) DO NOTHING;

-- 4) ลบ constraint เก่าที่อ้างคอลัมน即将ลบ
ALTER TABLE pe_evaluation_detail DROP CONSTRAINT IF EXISTS pe_evaluation_detail_self_score_chk;
ALTER TABLE pe_evaluation_detail DROP CONSTRAINT IF EXISTS pe_evaluation_detail_manager_score_chk;

-- 5) ลบคอลัมน์ออกจาก master (เกณฑ์รายละเอียด)
ALTER TABLE pe_evaluation_detail DROP COLUMN IF EXISTS grade_detail;
ALTER TABLE pe_evaluation_detail DROP COLUMN IF EXISTS self_score;
ALTER TABLE pe_evaluation_detail DROP COLUMN IF EXISTS self_detail;
ALTER TABLE pe_evaluation_detail DROP COLUMN IF EXISTS manager_score;
ALTER TABLE pe_evaluation_detail DROP COLUMN IF EXISTS manager_detail;

COMMENT ON TABLE pe_evaluation_detail IS 'เกณฑ์รายละเอียดต่อหัวข้อย่อย (หัวข้อ + ช่วงคะแนน) — ผลประเมินอยู่ที่ pe_evaluation_detail_result';
