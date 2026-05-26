-- PE: หัวข้อย่อยภายใต้หัวข้อหลัก
CREATE TABLE IF NOT EXISTS pe_evaluation_sub (
    id                  BIGSERIAL PRIMARY KEY,
    pe_evaluation_head  BIGINT       NOT NULL,
    sub_topic           VARCHAR(500) NOT NULL,
    min_score           NUMERIC(8, 2) NOT NULL DEFAULT 0,
    max_score           NUMERIC(8, 2) NOT NULL DEFAULT 0,
    grade_criteria      JSONB        NOT NULL DEFAULT '[]'::jsonb,
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by          VARCHAR(50),
    created_date        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_sub_head_fk
        FOREIGN KEY (pe_evaluation_head) REFERENCES pe_evaluation_head (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_sub_created_by_fk
        FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_sub_head
    ON pe_evaluation_sub (pe_evaluation_head);
CREATE INDEX IF NOT EXISTS idx_pe_evaluation_sub_active
    ON pe_evaluation_sub (active) WHERE active = TRUE;

COMMENT ON TABLE pe_evaluation_sub IS 'หัวข้อย่อยแบบประเมิน — เกณฑ์เกรดใน grade_criteria (แสดงใน ESS); คะแนนอยู่ pe_evaluation_result';
COMMENT ON COLUMN pe_evaluation_sub.grade_criteria IS 'เกณฑ์เกรด [{detailTopic, grade, minScore, maxScore}]';
