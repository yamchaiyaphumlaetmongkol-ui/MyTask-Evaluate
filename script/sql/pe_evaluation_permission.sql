-- PE: สิทธิ์แก้ไข / ประเมิน ตาม role และตำแหน่ง (head | sub | detail)
-- is_all = TRUE  → ทุก role หรือทุกตำแหน่ง (ตาม target_type)
-- is_all = FALSE → ระบุรหัสใน target_code
CREATE TABLE IF NOT EXISTS pe_evaluation_permission (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(20)  NOT NULL,
    entity_id       BIGINT       NOT NULL,
    permission_type VARCHAR(20)  NOT NULL,
    target_type     VARCHAR(20)  NOT NULL,
    target_code     VARCHAR(50),
    is_all          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_permission_entity_type_chk
        CHECK (entity_type IN ('head', 'sub', 'detail')),
    CONSTRAINT pe_evaluation_permission_type_chk
        CHECK (permission_type IN ('edit', 'evaluate')),
    CONSTRAINT pe_evaluation_permission_target_chk
        CHECK (target_type IN ('role', 'position')),
    CONSTRAINT pe_evaluation_permission_all_or_code_chk
        CHECK (
            (is_all = TRUE AND target_code IS NULL)
            OR (is_all = FALSE AND target_code IS NOT NULL)
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS pe_evaluation_permission_all_uq
    ON pe_evaluation_permission (entity_type, entity_id, permission_type, target_type)
    WHERE is_all = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS pe_evaluation_permission_code_uq
    ON pe_evaluation_permission (entity_type, entity_id, permission_type, target_type, target_code)
    WHERE is_all = FALSE;

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_permission_entity
    ON pe_evaluation_permission (entity_type, entity_id);

COMMENT ON TABLE pe_evaluation_permission IS 'สิทธิ์แก้ไขและเข้าประเมินตาม role/ตำแหน่ง';
COMMENT ON COLUMN pe_evaluation_permission.is_all IS 'TRUE = เลือกทั้งหมดของ target_type นั้น';
