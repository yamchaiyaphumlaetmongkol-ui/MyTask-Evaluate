-- PE: เกณฑ์รายละเอียดต่อหัวข้อย่อย (หัวข้อ + ช่วงคะแนน)
-- ผลประเมินจริง (self/manager) อยู่ที่ pe_evaluation_detail_result
CREATE TABLE IF NOT EXISTS pe_evaluation_detail (
    id                  BIGSERIAL PRIMARY KEY,
    pe_evaluation_sub   BIGINT       NOT NULL,
    detail_topic        VARCHAR(500) NOT NULL,
    max_score           NUMERIC(8, 2) NOT NULL DEFAULT 0,
    min_score           NUMERIC(8, 2) NOT NULL DEFAULT 0,
    grade               VARCHAR(20),
    created_by          VARCHAR(50),
    created_date        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_detail_sub_fk
        FOREIGN KEY (pe_evaluation_sub) REFERENCES pe_evaluation_sub (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_detail_score_range_chk
        CHECK (min_score <= max_score),
    CONSTRAINT pe_evaluation_detail_created_by_fk
        FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_detail_sub
    ON pe_evaluation_detail (pe_evaluation_sub);

COMMENT ON TABLE pe_evaluation_detail IS 'เกณฑ์รายละเอียดต่อหัวข้อย่อย — ผลประเมินอยู่ pe_evaluation_detail_result';
