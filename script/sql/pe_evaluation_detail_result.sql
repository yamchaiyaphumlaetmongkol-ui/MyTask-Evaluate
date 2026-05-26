-- PE: ผลการประเมินต่อรายละเอียด (เกณฑ์) — แยกตามผู้ถูกประเมิน และผู้ประเมิน (ตนเอง / ผู้บังคับบัญชา)
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
        ON UPDATE CASCADE ON DELETE SET NULL
    CONSTRAINT pe_evaluation_detail_result_unique_uq
        UNIQUE (pe_evaluation_detail, employee_code, evaluator_type)
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_detail_result_detail
    ON pe_evaluation_detail_result (pe_evaluation_detail);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_detail_result_employee
    ON pe_evaluation_detail_result (employee_code);

COMMENT ON TABLE pe_evaluation_detail_result IS 'ผลประเมินต่อรายละเอียด — คะแนน/ข้อความของพนักงาน (self) และผู้บังคับบัญชา (manager)';
COMMENT ON COLUMN pe_evaluation_detail_result.employee_code IS 'รหัสพนักงานผู้ถูกประเมิน';
COMMENT ON COLUMN pe_evaluation_detail_result.evaluator_type IS 'self = ประเมินตนเอง, manager = ผู้บังคับบัญชาประเมิน';
COMMENT ON COLUMN pe_evaluation_detail_result.evaluator_employee_code IS 'รหัสผู้กรอกผล (manager); self มักตรงกับ employee_code';
COMMENT ON COLUMN pe_evaluation_detail_result.result_detail IS 'รายละเอียด/คำอธิบายผลประเมิน';
