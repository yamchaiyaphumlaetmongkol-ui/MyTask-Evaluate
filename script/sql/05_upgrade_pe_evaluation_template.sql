-- =============================================================================
-- อัปเกรดทีหลัง: เพิ่มตารางแบบประเมิน (pe_evaluation_template)
--            + คอลัมน์ FK ที่ pe_evaluation_head
--
-- ใช้เมื่อ: ติดตั้ง schema ชุดแรกแล้ว (00_install) แต่ยังไม่มีตาราง template
--
-- วิธีรัน (เลือกอย่างใดอย่างหนึ่ง):
--   psql "$DATABASE_URL" -f script/sql/05_upgrade_pe_evaluation_template.sql
--   หรือ copy ทั้งไฟล์ไปรันใน Neon / pgAdmin SQL Editor
--
-- ปลอดภัยรันซ้ำ: ใช้ IF NOT EXISTS / ตรวจ constraint ก่อนเพิ่ม
-- ข้อมูล HEAD เดิม: สร้างแบบประเมิน 1 ชุดต่อ 1 HEAD แล้วผูก FK อัตโนมัติ
-- =============================================================================

-- 1) ตารางแบบประเมิน
CREATE TABLE IF NOT EXISTS pe_evaluation_template (
    id              BIGSERIAL PRIMARY KEY,
    template_name   VARCHAR(300) NOT NULL,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_template_active
    ON pe_evaluation_template (active) WHERE active = TRUE;

COMMENT ON TABLE pe_evaluation_template IS 'แบบประเมิน — ชื่อชุดที่รวมหัวข้อประเมินหลัก (HEAD) หลายรายการ';
COMMENT ON COLUMN pe_evaluation_template.template_name IS 'ชื่อแบบประเมิน';

-- 2) คอลัมน์ FK ที่ head (nullable ชั่วคราวจน backfill เสร็จ)
ALTER TABLE pe_evaluation_head
    ADD COLUMN IF NOT EXISTS pe_evaluation_template BIGINT;

-- 3) Foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pe_evaluation_head_template_fk'
    ) THEN
        ALTER TABLE pe_evaluation_head
            ADD CONSTRAINT pe_evaluation_head_template_fk
                FOREIGN KEY (pe_evaluation_template) REFERENCES pe_evaluation_template (id)
                ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_head_template
    ON pe_evaluation_head (pe_evaluation_template);

-- 4) trigger updated_date (ถ้ามีฟังก์ชัน set_updated_date จาก 00_install แล้ว)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'set_updated_date'
    ) THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_pe_evaluation_template_updated_date ON pe_evaluation_template';
        EXECUTE '
            CREATE TRIGGER trg_pe_evaluation_template_updated_date
                BEFORE UPDATE ON pe_evaluation_template
                FOR EACH ROW EXECUTE PROCEDURE set_updated_date()';
    END IF;
END $$;

-- 5) ย้าย HEAD เดิมที่ยังไม่มี template → สร้างแบบประเมิน 1 ชุดต่อ 1 head
INSERT INTO pe_evaluation_template (template_name, active, created_date, updated_date)
SELECT
    LEFT('แบบประเมิน #' || h.id::text || ': ' || h.head_topic, 300),
    COALESCE(h.active, TRUE),
    h.created_date,
    h.updated_date
FROM pe_evaluation_head h
WHERE h.pe_evaluation_template IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM pe_evaluation_template t
      WHERE t.template_name = LEFT('แบบประเมิน #' || h.id::text || ': ' || h.head_topic, 300)
  );

UPDATE pe_evaluation_head h
SET pe_evaluation_template = t.id
FROM pe_evaluation_template t
WHERE h.pe_evaluation_template IS NULL
  AND t.template_name = LEFT('แบบประเมิน #' || h.id::text || ': ' || h.head_topic, 300);

COMMENT ON COLUMN pe_evaluation_head.pe_evaluation_template IS 'FK ไปแบบประเมินที่ head นี้อยู่ภายใต้';

-- 6) (ทางเลือก) บังคับ NOT NULL หลัง backfill — เปิด comment ถ้าต้องการ
-- DO $$
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM pe_evaluation_head WHERE pe_evaluation_template IS NULL
--     ) THEN
--         RAISE EXCEPTION 'ยังมี pe_evaluation_head ที่ไม่มี pe_evaluation_template — ตรวจ backfill ก่อน';
--     END IF;
--     ALTER TABLE pe_evaluation_head
--         ALTER COLUMN pe_evaluation_template SET NOT NULL;
-- END $$;

-- ตรวจผลหลังรัน (optional)
-- SELECT COUNT(*) AS templates FROM pe_evaluation_template;
-- SELECT COUNT(*) AS heads_without_template FROM pe_evaluation_head WHERE pe_evaluation_template IS NULL;
