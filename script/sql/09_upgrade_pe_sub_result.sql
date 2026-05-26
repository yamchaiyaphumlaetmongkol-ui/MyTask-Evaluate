-- =============================================================================
-- ย้ายเกณฑ์เกรด → pe_evaluation_sub.grade_criteria (JSONB)
-- ผลประเมิน → pe_evaluation_result (FK หัวข้อย่อย)
-- ลบ pe_evaluation_detail / pe_evaluation_detail_result
--
-- รัน: psql "$DATABASE_URL" -f script/sql/09_upgrade_pe_sub_result.sql
-- แล้ว: npx prisma generate && npx prisma db push
-- =============================================================================

-- 1) คอลัมน์ใหม่บนหัวข้อย่อย
ALTER TABLE pe_evaluation_sub
    ADD COLUMN IF NOT EXISTS min_score       NUMERIC(8, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_score       NUMERIC(8, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS grade_criteria  JSONB         NOT NULL DEFAULT '[]'::jsonb;

-- 2) ย้ายแถวเกณฑ์จาก pe_evaluation_detail → JSON ต่อ sub
UPDATE pe_evaluation_sub s
SET
    grade_criteria = COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'detailTopic', d.detail_topic,
                    'grade', d.grade,
                    'minScore', d.min_score,
                    'maxScore', d.max_score
                )
                ORDER BY d.id
            )
            FROM pe_evaluation_detail d
            WHERE d.pe_evaluation_sub = s.id
        ),
        '[]'::jsonb
    ),
    min_score = COALESCE(
        (SELECT MIN(d.min_score) FROM pe_evaluation_detail d WHERE d.pe_evaluation_sub = s.id),
        0
    ),
    max_score = COALESCE(
        (SELECT MAX(d.max_score) FROM pe_evaluation_detail d WHERE d.pe_evaluation_sub = s.id),
        0
    )
WHERE EXISTS (SELECT 1 FROM pe_evaluation_detail d WHERE d.pe_evaluation_sub = s.id);

-- 3) ตารางผลประเมินใหม่
CREATE TABLE IF NOT EXISTS pe_evaluation_result (
    id                      BIGSERIAL PRIMARY KEY,
    pe_evaluation_sub       BIGINT       NOT NULL,
    employee_code           VARCHAR(50)  NOT NULL,
    evaluator_type          VARCHAR(20)  NOT NULL,
    evaluator_employee_code VARCHAR(50),
    score                   NUMERIC(8, 2),
    result_detail           TEXT,
    created_date            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_result_sub_fk
        FOREIGN KEY (pe_evaluation_sub) REFERENCES pe_evaluation_sub (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pe_evaluation_result_employee_fk
        FOREIGN KEY (employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_result_evaluator_fk
        FOREIGN KEY (evaluator_employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT pe_evaluation_result_unique_uq
        UNIQUE (pe_evaluation_sub, employee_code, evaluator_type)
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_result_sub
    ON pe_evaluation_result (pe_evaluation_sub);
CREATE INDEX IF NOT EXISTS idx_pe_evaluation_result_employee
    ON pe_evaluation_result (employee_code);

-- 4) ย้ายผลจาก detail_result → result (รวมต่อ sub — เก็บแถวล่าสุดตาม id)
INSERT INTO pe_evaluation_result (
    pe_evaluation_sub,
    employee_code,
    evaluator_type,
    evaluator_employee_code,
    score,
    result_detail,
    created_date,
    updated_date
)
SELECT DISTINCT ON (d.pe_evaluation_sub, r.employee_code, r.evaluator_type)
    d.pe_evaluation_sub,
    r.employee_code,
    r.evaluator_type,
    r.evaluator_employee_code,
    r.score,
    r.result_detail,
    r.created_date,
    r.updated_date
FROM pe_evaluation_detail_result r
JOIN pe_evaluation_detail d ON d.id = r.pe_evaluation_detail
ORDER BY d.pe_evaluation_sub, r.employee_code, r.evaluator_type, r.id DESC
ON CONFLICT (pe_evaluation_sub, employee_code, evaluator_type) DO NOTHING;

-- 5) trigger updated_date
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_date') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_pe_evaluation_result_updated_date ON pe_evaluation_result';
        EXECUTE '
            CREATE TRIGGER trg_pe_evaluation_result_updated_date
                BEFORE UPDATE ON pe_evaluation_result
                FOR EACH ROW EXECUTE PROCEDURE set_updated_date()';
    END IF;
END $$;

-- 6) ลบตารางเก่า
DROP TABLE IF EXISTS pe_evaluation_detail_result CASCADE;
DROP TABLE IF EXISTS pe_evaluation_detail CASCADE;

COMMENT ON COLUMN pe_evaluation_sub.grade_criteria IS 'เกณฑ์เกรดต่อหัวข้อย่อย (แสดงใน ESS) — JSON array';
COMMENT ON COLUMN pe_evaluation_sub.min_score IS 'คะแนนต่ำสุดที่กรอกได้ต่อหัวข้อย่อย';
COMMENT ON COLUMN pe_evaluation_sub.max_score IS 'คะแนนสูงสุดที่กรอกได้ต่อหัวข้อย่อย';
COMMENT ON TABLE pe_evaluation_result IS 'ผลประเมินต่อหัวข้อย่อย (self/manager)';
