-- PM: บทบาท (Role master)
CREATE TABLE IF NOT EXISTS pm_role (
    id              BIGSERIAL PRIMARY KEY,
    role_code       VARCHAR(50)  NOT NULL,
    role_name       VARCHAR(200) NOT NULL,
    role_level      SMALLINT,
    role_description TEXT,
    role_status     VARCHAR(20),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_role_role_code_uq UNIQUE (role_code)
);

CREATE INDEX IF NOT EXISTS idx_pm_role_active ON pm_role (active) WHERE active = TRUE;

COMMENT ON TABLE pm_role IS 'ข้อมูลบทบาทพนักงาน';
COMMENT ON COLUMN pm_role.role_level IS 'ระดับบทบาท (เลขน้อย = สูง หรือตามกฎธุรกิจ)';
