-- =============================================================================
-- MyPerformanceV2 — Fresh Install (สร้าง schema ทั้งหมดในไฟล์เดียว)
-- ใช้กับ PostgreSQL 14+
--
-- รัน:
--   psql "$DATABASE_URL" -f script/sql/install_fresh.sql
--
-- หมายเหตุ:
--   - ใช้ CREATE TABLE IF NOT EXISTS ทุกตาราง (รันซ้ำได้อย่างปลอดภัย)
--   - ถ้าต้องการรีเซ็ตทั้งหมด ให้รัน 99_drop.sql ก่อน แล้วรันไฟล์นี้ใหม่
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. ENUM
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "AppAuthRole" AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- 2. PM — ข้อมูลพนักงาน
-- =============================================================================

-- 2.1 บทบาท (Role)
CREATE TABLE IF NOT EXISTS pm_role (
    id               BIGSERIAL     PRIMARY KEY,
    role_code        VARCHAR(50)   NOT NULL,
    role_name        VARCHAR(200)  NOT NULL,
    role_level       SMALLINT,
    role_description TEXT,
    role_status      VARCHAR(20),
    active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_role_role_code_uq UNIQUE (role_code)
);

CREATE INDEX IF NOT EXISTS idx_pm_role_active ON pm_role (active) WHERE active = TRUE;

-- 2.2 ตำแหน่งงาน (Position)
CREATE TABLE IF NOT EXISTS pm_position (
    id               BIGSERIAL     PRIMARY KEY,
    position_code    VARCHAR(50)   NOT NULL,
    position_name    VARCHAR(200)  NOT NULL,
    description      TEXT,
    status           VARCHAR(20),
    active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_position_position_code_uq UNIQUE (position_code)
);

CREATE INDEX IF NOT EXISTS idx_pm_position_active ON pm_position (active) WHERE active = TRUE;

-- 2.3 พนักงาน (Employee)
CREATE TABLE IF NOT EXISTS pm_employee (
    id                    BIGSERIAL     PRIMARY KEY,
    employee_code         VARCHAR(50)   UNIQUE,
    title_name            VARCHAR(50),
    first_name            VARCHAR(100)  NOT NULL,
    last_name             VARCHAR(100)  NOT NULL,
    email                 VARCHAR(255)  NOT NULL UNIQUE,
    clickup_user_id       VARCHAR(50)   UNIQUE,
    clickup_username      VARCHAR(200),
    clickup_email         VARCHAR(255),
    clickup_profile_image TEXT,
    position_code         VARCHAR(50),
    role_code             VARCHAR(50),
    active                BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_employee_position_code_fk
        FOREIGN KEY (position_code) REFERENCES pm_position (position_code)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT pm_employee_role_code_fk
        FOREIGN KEY (role_code) REFERENCES pm_role (role_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pm_employee_active       ON pm_employee (active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pm_employee_position     ON pm_employee (position_code);
CREATE INDEX IF NOT EXISTS idx_pm_employee_role         ON pm_employee (role_code);

-- 2.4 ความสัมพันธ์หัวหน้า–ลูกน้อง (Manager–Subordinate)
CREATE TABLE IF NOT EXISTS pm_role_subordinate (
    id             BIGSERIAL     PRIMARY KEY,
    manager_code   VARCHAR(50)   NOT NULL,
    employee_code  VARCHAR(50)   NOT NULL,
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_role_subordinate_pair_uq       UNIQUE (manager_code, employee_code),
    CONSTRAINT pm_role_subordinate_not_self_chk  CHECK (manager_code <> employee_code),
    CONSTRAINT pm_role_subordinate_manager_fk
        FOREIGN KEY (manager_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pm_role_subordinate_employee_fk
        FOREIGN KEY (employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pm_role_subordinate_manager  ON pm_role_subordinate (manager_code);
CREATE INDEX IF NOT EXISTS idx_pm_role_subordinate_employee ON pm_role_subordinate (employee_code);


-- =============================================================================
-- 3. Auth — บัญชีผู้ใช้และ Session
-- =============================================================================

-- 3.1 บัญชีผู้ใช้ (username = ClickUp email หรือ admin)
CREATE TABLE IF NOT EXISTS app_user_auth (
    id                   BIGSERIAL       PRIMARY KEY,
    username             TEXT            NOT NULL UNIQUE,
    password_hash        TEXT            NOT NULL,
    role                 "AppAuthRole"   NOT NULL DEFAULT 'user',
    must_change_password BOOLEAN         NOT NULL DEFAULT TRUE,
    employee_id          BIGINT          UNIQUE,
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT app_user_auth_employee_fk
        FOREIGN KEY (employee_id) REFERENCES pm_employee (id)
        ON DELETE SET NULL
);

-- 3.2 Session token
CREATE TABLE IF NOT EXISTS app_session (
    id          TEXT        PRIMARY KEY,
    token_hash  TEXT        NOT NULL UNIQUE,
    user_id     BIGINT      NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT app_session_user_fk
        FOREIGN KEY (user_id) REFERENCES app_user_auth (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS app_session_user_id_idx    ON app_session (user_id);
CREATE INDEX IF NOT EXISTS app_session_expires_at_idx ON app_session (expires_at);

-- 3.3 ผูก login email กับ pm_employee (สำหรับระบบ SSO / ClickUp)
CREATE TABLE IF NOT EXISTS user_identity_binding (
    id               BIGSERIAL     PRIMARY KEY,
    login_email      VARCHAR(255)  NOT NULL UNIQUE,
    employee_id      BIGINT        NOT NULL UNIQUE,
    created_by_email VARCHAR(255),
    updated_by_email VARCHAR(255),
    created_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT user_identity_binding_employee_fk
        FOREIGN KEY (employee_id) REFERENCES pm_employee (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_identity_binding_employee ON user_identity_binding (employee_id);


-- =============================================================================
-- 4. PE — แบบประเมิน (Master / Round / Head / Sub / Result / Permission)
-- =============================================================================

-- 4.1 แม่แบบแบบประเมิน
CREATE TABLE IF NOT EXISTS pe_evaluation_template_master (
    id            BIGSERIAL     PRIMARY KEY,
    master_name   VARCHAR(300)  NOT NULL,
    description   TEXT,
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4.2 หัวข้อแม่แบบ (Blueprint)
CREATE TABLE IF NOT EXISTS pe_evaluation_master_head (
    id            BIGSERIAL     PRIMARY KEY,
    master_id     BIGINT        NOT NULL,
    head_topic    VARCHAR(500)  NOT NULL,
    proportion    DECIMAL(5,2)  NOT NULL DEFAULT 0,
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_master_head_master_fk
        FOREIGN KEY (master_id) REFERENCES pe_evaluation_template_master (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_master_head_master ON pe_evaluation_master_head (master_id);

-- 4.3 หัวข้อย่อยแม่แบบ
CREATE TABLE IF NOT EXISTS pe_evaluation_master_sub (
    id              BIGSERIAL     PRIMARY KEY,
    master_head_id  BIGINT        NOT NULL,
    sub_topic       VARCHAR(500)  NOT NULL,
    min_score       DECIMAL(8,2)  NOT NULL DEFAULT 0,
    max_score       DECIMAL(8,2)  NOT NULL DEFAULT 0,
    grade_criteria  JSONB         NOT NULL DEFAULT '[]'::jsonb,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_master_sub_head_fk
        FOREIGN KEY (master_head_id) REFERENCES pe_evaluation_master_head (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_master_sub_head ON pe_evaluation_master_sub (master_head_id);

-- 4.4 รอบประเมิน (เปิดจาก template_master)
CREATE TABLE IF NOT EXISTS pe_evaluation_round (
    id                 BIGSERIAL     PRIMARY KEY,
    master_id          BIGINT        NOT NULL,
    round_name         VARCHAR(300),
    evaluation_year    INT           NOT NULL,
    evaluation_period  VARCHAR(10)   NOT NULL,  -- H1 / H2
    start_date         DATE,
    end_date           DATE,
    status             VARCHAR(20)   NOT NULL DEFAULT 'open',
    active             BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_round_master_year_period_uq
        UNIQUE (master_id, evaluation_year, evaluation_period),
    CONSTRAINT pe_evaluation_round_master_fk
        FOREIGN KEY (master_id) REFERENCES pe_evaluation_template_master (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_round_master ON pe_evaluation_round (master_id);

-- 4.5 หัวข้อหลัก (อ้างอิง round)
CREATE TABLE IF NOT EXISTS pe_evaluation_head (
    id                   BIGSERIAL     PRIMARY KEY,
    pe_evaluation_round  BIGINT        NOT NULL,
    head_topic           VARCHAR(500)  NOT NULL,
    proportion           DECIMAL(5,2)  NOT NULL DEFAULT 0,
    active               BOOLEAN       NOT NULL DEFAULT TRUE,
    created_by           VARCHAR(50),
    created_date         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_head_proportion_chk  CHECK (proportion >= 0 AND proportion <= 100),
    CONSTRAINT pe_evaluation_head_round_fk
        FOREIGN KEY (pe_evaluation_round) REFERENCES pe_evaluation_round (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_head_created_by_fk
        FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_head_round  ON pe_evaluation_head (pe_evaluation_round);
CREATE INDEX IF NOT EXISTS idx_pe_evaluation_head_active ON pe_evaluation_head (active) WHERE active = TRUE;

-- 4.6 หัวข้อย่อย
CREATE TABLE IF NOT EXISTS pe_evaluation_sub (
    id                  BIGSERIAL     PRIMARY KEY,
    pe_evaluation_head  BIGINT        NOT NULL,
    sub_topic           VARCHAR(500)  NOT NULL,
    min_score           DECIMAL(8,2)  NOT NULL DEFAULT 0,
    max_score           DECIMAL(8,2)  NOT NULL DEFAULT 0,
    grade_criteria      JSONB         NOT NULL DEFAULT '[]'::jsonb,
    active              BOOLEAN       NOT NULL DEFAULT TRUE,
    created_by          VARCHAR(50),
    created_date        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_sub_head_fk
        FOREIGN KEY (pe_evaluation_head) REFERENCES pe_evaluation_head (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_sub_created_by_fk
        FOREIGN KEY (created_by) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_sub_head   ON pe_evaluation_sub (pe_evaluation_head);
CREATE INDEX IF NOT EXISTS idx_pe_evaluation_sub_active ON pe_evaluation_sub (active) WHERE active = TRUE;

-- 4.7 ผลประเมิน (self + manager ในแถวเดียว)
CREATE TABLE IF NOT EXISTS pe_evaluation_result (
    id                    BIGSERIAL     PRIMARY KEY,
    pe_evaluation_sub     BIGINT        NOT NULL,
    employee_code         VARCHAR(50)   NOT NULL,
    self_score            DECIMAL(8,2),
    self_detail           TEXT,
    manager_score         DECIMAL(8,2),
    manager_detail        TEXT,
    manager_employee_code VARCHAR(50),
    created_date          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_date          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_result_unique_uq
        UNIQUE (pe_evaluation_sub, employee_code),
    CONSTRAINT pe_evaluation_result_sub_fk
        FOREIGN KEY (pe_evaluation_sub) REFERENCES pe_evaluation_sub (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pe_evaluation_result_employee_fk
        FOREIGN KEY (employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT pe_evaluation_result_manager_fk
        FOREIGN KEY (manager_employee_code) REFERENCES pm_employee (employee_code)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_result_sub      ON pe_evaluation_result (pe_evaluation_sub);
CREATE INDEX IF NOT EXISTS idx_pe_evaluation_result_employee ON pe_evaluation_result (employee_code);

-- 4.8 สิทธิ์ (เข้าแก้ไข / ประเมิน ตาม role หรือ position)
CREATE TABLE IF NOT EXISTS pe_evaluation_permission (
    id              BIGSERIAL     PRIMARY KEY,
    entity_type     VARCHAR(20)   NOT NULL,  -- head | sub | detail
    entity_id       BIGINT        NOT NULL,
    permission_type VARCHAR(20)   NOT NULL,  -- edit | evaluate
    target_type     VARCHAR(20)   NOT NULL,  -- role | position
    target_code     VARCHAR(50),
    is_all          BOOLEAN       NOT NULL DEFAULT FALSE,
    created_date    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_permission_entity_type_chk   CHECK (entity_type     IN ('head', 'sub', 'detail')),
    CONSTRAINT pe_evaluation_permission_type_chk          CHECK (permission_type IN ('edit', 'evaluate')),
    CONSTRAINT pe_evaluation_permission_target_chk        CHECK (target_type     IN ('role', 'position')),
    CONSTRAINT pe_evaluation_permission_all_or_code_chk
        CHECK ((is_all = TRUE AND target_code IS NULL) OR (is_all = FALSE AND target_code IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS pe_evaluation_permission_all_uq
    ON pe_evaluation_permission (entity_type, entity_id, permission_type, target_type)
    WHERE is_all = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS pe_evaluation_permission_code_uq
    ON pe_evaluation_permission (entity_type, entity_id, permission_type, target_type, target_code)
    WHERE is_all = FALSE;

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_permission_entity
    ON pe_evaluation_permission (entity_type, entity_id);


-- =============================================================================
-- 5. Trigger — อัปเดต updated_date อัตโนมัติ
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'pm_role',
        'pm_position',
        'pm_employee',
        'pm_role_subordinate',
        'pe_evaluation_template_master',
        'pe_evaluation_master_head',
        'pe_evaluation_master_sub',
        'pe_evaluation_round',
        'pe_evaluation_head',
        'pe_evaluation_sub',
        'pe_evaluation_result',
        'pe_evaluation_permission',
        'user_identity_binding'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_date ON %I', t, t);
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_date
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE PROCEDURE set_updated_date()',
            t, t
        );
    END LOOP;
END $$;


-- =============================================================================
-- 6. Seed — ข้อมูลตั้งต้น
-- =============================================================================

-- บทบาทตัวอย่าง
INSERT INTO pm_role (role_code, role_name, role_level, active) VALUES
    ('R01', 'พนักงาน',      1, TRUE),
    ('R02', 'หัวหน้างาน',   2, TRUE),
    ('R03', 'ผู้จัดการ',    3, TRUE),
    ('R04', 'HR',           4, TRUE)
ON CONFLICT (role_code) DO NOTHING;

-- ตำแหน่งตัวอย่าง
INSERT INTO pm_position (position_code, position_name, active) VALUES
    ('P01', 'โปรแกรมเมอร์',  TRUE),
    ('P02', 'นักวิเคราะห์',  TRUE),
    ('P03', 'หัวหน้าทีม',    TRUE),
    ('P04', 'ผู้จัดการฝ่าย', TRUE)
ON CONFLICT (position_code) DO NOTHING;

COMMIT;

-- =============================================================================
-- เสร็จสิ้น
-- บัญชี admin จะถูกสร้างอัตโนมัติเมื่อ login ครั้งแรก
--   username: admin
--   password: Admin1234*
-- =============================================================================
