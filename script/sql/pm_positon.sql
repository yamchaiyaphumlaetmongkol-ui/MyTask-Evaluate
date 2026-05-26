-- PM: ตำแหน่ง (Position master) — ชื่อไฟล์สะกด positon ตามโปรเจกต์
CREATE TABLE IF NOT EXISTS pm_position (
    id              BIGSERIAL PRIMARY KEY,
    position_code   VARCHAR(50)  NOT NULL,
    position_name   VARCHAR(200) NOT NULL,
    description     TEXT,
    status          VARCHAR(20),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pm_position_position_code_uq UNIQUE (position_code)
);

CREATE INDEX IF NOT EXISTS idx_pm_position_active ON pm_position (active) WHERE active = TRUE;

COMMENT ON TABLE pm_position IS 'ข้อมูลตำแหน่งงาน';
