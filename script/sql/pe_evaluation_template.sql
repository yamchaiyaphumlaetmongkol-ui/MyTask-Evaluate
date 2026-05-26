-- PE: แบบประเมิน (รวมหัวข้อประเมินหลักหลายรายการ)
CREATE TABLE IF NOT EXISTS pe_evaluation_template (
    id                  BIGSERIAL PRIMARY KEY,
    template_name       VARCHAR(300) NOT NULL,
    start_date          DATE,
    end_date            DATE,
    evaluation_period   VARCHAR(10),
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_template_active
    ON pe_evaluation_template (active) WHERE active = TRUE;

COMMENT ON TABLE pe_evaluation_template IS 'แบบประเมิน — ชื่อชุดที่รวมหัวข้อประเมินหลัก (HEAD) หลายรายการ';
COMMENT ON COLUMN pe_evaluation_template.template_name IS 'ชื่อแบบประเมิน';
COMMENT ON COLUMN pe_evaluation_template.evaluation_period IS 'ช่วงประเมิน: H1=ครึ่งแรก, H2=ครึ่งหลัง';
