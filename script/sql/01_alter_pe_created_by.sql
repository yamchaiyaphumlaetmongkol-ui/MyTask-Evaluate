-- เพิ่มผู้สร้าง (รันหลังตารางหลักมีอยู่แล้ว)
ALTER TABLE pe_evaluation_head
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

ALTER TABLE pe_evaluation_sub
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

ALTER TABLE pe_evaluation_detail
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

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
