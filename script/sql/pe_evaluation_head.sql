-- PE: หัวข้อใหญ่ของแบบประเมิน (สัดส่วนคะแนนรวม)
CREATE TABLE IF NOT EXISTS pe_evaluation_head (
    id                      BIGSERIAL PRIMARY KEY,
    pe_evaluation_template  BIGINT       NOT NULL,
    head_topic              VARCHAR(500) NOT NULL,
    proportion      NUMERIC(5, 2) NOT NULL DEFAULT 0, -- สัดส่วน (%) รวม 100 ต่อแบบประเมิน
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by      VARCHAR(50),
    created_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_head_proportion_chk
        CHECK (proportion >= 0 AND proportion <= 100),
    CONSTRAINT pe_evaluation_head_template_fk
        FOREIGN KEY (pe_evaluation_template) REFERENCES pe_evaluation_template (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_head_created_by_fk
        FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_head_active ON pe_evaluation_head (active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pe_evaluation_head_template ON pe_evaluation_head (pe_evaluation_template);

COMMENT ON TABLE pe_evaluation_head IS 'หัวข้อหลักแบบประเมินผลงาน — อยู่ภายใต้แบบประเมิน (pe_evaluation_template)';
COMMENT ON COLUMN pe_evaluation_head.pe_evaluation_template IS 'FK แบบประเมินที่ head นี้สังกัด';
COMMENT ON COLUMN pe_evaluation_head.proportion IS 'สัดส่วนคะแนนของหัวข้อนี้ (เปอร์เซ็นต์)';
