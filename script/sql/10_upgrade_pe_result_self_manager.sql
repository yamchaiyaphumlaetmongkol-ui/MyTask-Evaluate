-- คอลัมน์ self/manager แยกในตาราง pe_evaluation_result (แถวเดียวต่อ sub + พนักงาน)
-- รัน: psql "$DATABASE_URL" -f script/sql/10_upgrade_pe_result_self_manager.sql

ALTER TABLE pe_evaluation_result
    ADD COLUMN IF NOT EXISTS self_score           NUMERIC(8, 2),
    ADD COLUMN IF NOT EXISTS self_detail          TEXT,
    ADD COLUMN IF NOT EXISTS manager_score        NUMERIC(8, 2),
    ADD COLUMN IF NOT EXISTS manager_detail       TEXT,
    ADD COLUMN IF NOT EXISTS manager_employee_code VARCHAR(50);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'pe_evaluation_result'
          AND column_name = 'evaluator_type'
    ) THEN
        UPDATE pe_evaluation_result
        SET self_score = score, self_detail = result_detail
        WHERE evaluator_type = 'self';

        UPDATE pe_evaluation_result r
        SET
            manager_score = m.score,
            manager_detail = m.result_detail,
            manager_employee_code = m.evaluator_employee_code
        FROM pe_evaluation_result m
        WHERE m.pe_evaluation_sub = r.pe_evaluation_sub
          AND m.employee_code = r.employee_code
          AND m.evaluator_type = 'manager'
          AND r.evaluator_type = 'self';

        DELETE FROM pe_evaluation_result WHERE evaluator_type = 'manager';

        ALTER TABLE pe_evaluation_result DROP CONSTRAINT IF EXISTS pe_evaluation_result_unique_uq;
        ALTER TABLE pe_evaluation_result DROP CONSTRAINT IF EXISTS pe_evaluation_detail_result_unique_uq;
        ALTER TABLE pe_evaluation_result DROP COLUMN IF EXISTS evaluator_type;
        ALTER TABLE pe_evaluation_result DROP COLUMN IF EXISTS evaluator_employee_code;
        ALTER TABLE pe_evaluation_result DROP COLUMN IF EXISTS score;
        ALTER TABLE pe_evaluation_result DROP COLUMN IF EXISTS result_detail;
    END IF;
END $$;

ALTER TABLE pe_evaluation_result DROP CONSTRAINT IF EXISTS pe_evaluation_result_unique_uq;
ALTER TABLE pe_evaluation_result
    ADD CONSTRAINT pe_evaluation_result_unique_uq
        UNIQUE (pe_evaluation_sub, employee_code);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pe_evaluation_result_manager_fk'
    ) THEN
        ALTER TABLE pe_evaluation_result
            ADD CONSTRAINT pe_evaluation_result_manager_fk
                FOREIGN KEY (manager_employee_code) REFERENCES pm_employee (employee_code)
                ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;

COMMENT ON COLUMN pe_evaluation_result.self_score IS 'คะแนนประเมินตนเอง (ESSPETS02)';
COMMENT ON COLUMN pe_evaluation_result.self_detail IS 'รายละเอียดประเมินตนเอง';
COMMENT ON COLUMN pe_evaluation_result.manager_score IS 'คะแนนผู้ประเมิน (ESSPETS04)';
COMMENT ON COLUMN pe_evaluation_result.manager_detail IS 'รายละเอียดผู้ประเมิน';
