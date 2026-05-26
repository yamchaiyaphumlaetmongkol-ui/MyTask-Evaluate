-- PE: ผลการประเมินต่อหัวข้อย่อย (self + manager ในแถวเดียว)
CREATE TABLE IF NOT EXISTS pe_evaluation_result (
    id                      BIGSERIAL PRIMARY KEY,
    pe_evaluation_sub       BIGINT       NOT NULL,
    employee_code           VARCHAR(50)  NOT NULL,
    self_score              NUMERIC(8, 2),
    self_detail             TEXT,
    manager_score           NUMERIC(8, 2),
    manager_detail          TEXT,
    manager_employee_code   VARCHAR(50),
    created_date            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_result_sub_fk
        FOREIGN KEY (pe_evaluation_sub) REFERENCES pe_evaluation_sub (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pe_evaluation_result_employee_fk
        FOREIGN KEY (employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_result_manager_fk
        FOREIGN KEY (manager_employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT pe_evaluation_result_unique_uq
        UNIQUE (pe_evaluation_sub, employee_code)
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_result_sub
    ON pe_evaluation_result (pe_evaluation_sub);
CREATE INDEX IF NOT EXISTS idx_pe_evaluation_result_employee
    ON pe_evaluation_result (employee_code);

COMMENT ON TABLE pe_evaluation_result IS 'ผลประเมินต่อหัวข้อย่อย — self_score/self_detail และ manager_score/manager_detail';
