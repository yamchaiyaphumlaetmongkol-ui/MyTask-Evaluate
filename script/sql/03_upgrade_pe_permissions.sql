-- รันต่อจาก 00_install ชุดแรก (ก่อนมี permission / created_by)
-- psql "$DATABASE_URL" -f script/sql/03_upgrade_pe_permissions.sql

ALTER TABLE pe_evaluation_head
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

ALTER TABLE pe_evaluation_sub
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

ALTER TABLE pe_evaluation_detail
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

ALTER TABLE pe_evaluation_detail
    ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE pe_evaluation_detail
    ADD COLUMN IF NOT EXISTS updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pe_evaluation_head_created_by_fk'
    ) THEN
        ALTER TABLE pe_evaluation_head
            ADD CONSTRAINT pe_evaluation_head_created_by_fk
            FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
            ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pe_evaluation_sub_created_by_fk'
    ) THEN
        ALTER TABLE pe_evaluation_sub
            ADD CONSTRAINT pe_evaluation_sub_created_by_fk
            FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
            ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pe_evaluation_detail_created_by_fk'
    ) THEN
        ALTER TABLE pe_evaluation_detail
            ADD CONSTRAINT pe_evaluation_detail_created_by_fk
            FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
            ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;

\ir pe_evaluation_permission.sql

CREATE OR REPLACE FUNCTION set_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pe_evaluation_detail_updated_date ON pe_evaluation_detail;
CREATE TRIGGER trg_pe_evaluation_detail_updated_date
    BEFORE UPDATE ON pe_evaluation_detail
    FOR EACH ROW EXECUTE PROCEDURE set_updated_date();
