-- PM: พนักงาน
CREATE TABLE IF NOT EXISTS pm_employee (
    id              BIGSERIAL PRIMARY KEY,
    employee_code   VARCHAR(50),
    title_name      VARCHAR(50),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email                 VARCHAR(255) NOT NULL,
    clickup_user_id       VARCHAR(50),
    clickup_username      VARCHAR(200),
    clickup_email         VARCHAR(255),
    clickup_profile_image TEXT,
    position_code         VARCHAR(50),
    role_code       VARCHAR(50),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_employee_employee_code_uq UNIQUE (employee_code),
    CONSTRAINT pm_employee_email_uq UNIQUE (email),
    CONSTRAINT pm_employee_position_code_fk
        FOREIGN KEY (position_code) REFERENCES pm_position (position_code)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT pm_employee_role_code_fk
        FOREIGN KEY (role_code) REFERENCES pm_role (role_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS pm_employee_clickup_user_id_uq
    ON pm_employee (clickup_user_id) WHERE clickup_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pm_employee_active ON pm_employee (active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pm_employee_position_code ON pm_employee (position_code);
CREATE INDEX IF NOT EXISTS idx_pm_employee_role_code ON pm_employee (role_code);

COMMENT ON TABLE pm_employee IS 'ข้อมูลพนักงาน';
