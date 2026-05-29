-- PM: ความสัมพันธ์หัวหน้า–ลูกน้อง (ตามรหัสพนักงาน)
CREATE TABLE IF NOT EXISTS pm_role_subordinate (
    id              BIGSERIAL PRIMARY KEY,
    manager_code    VARCHAR(50) NOT NULL,
    employee_code   VARCHAR(50) NOT NULL,
    active          BOOLEAN     NOT NULL DEFAULT TRUE,
    created_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_role_subordinate_pair_uq UNIQUE (manager_code, employee_code),
    CONSTRAINT pm_role_subordinate_manager_fk
        FOREIGN KEY (manager_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pm_role_subordinate_employee_fk
        FOREIGN KEY (employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pm_role_subordinate_not_self_chk
        CHECK (manager_code <> employee_code)
);

CREATE INDEX IF NOT EXISTS idx_pm_role_subordinate_manager ON pm_role_subordinate (manager_code);
CREATE INDEX IF NOT EXISTS idx_pm_role_subordinate_employee ON pm_role_subordinate (employee_code);

COMMENT ON TABLE pm_role_subordinate IS 'ผู้จัดการและผู้ใต้บังคับบัญชา';
