-- =============================================================================
-- แยกแม่แบบ (master) กับรอบประเมิน (round)
--
-- ลำดับรัน: ดู script/sql/README.md (กรณี C)
--   12 (ถ้ายังไม่มี period) → 13 → 13_verify (ทางเลือก)
--
-- หลังรัน: cd skibidi_evaluate_project && npx prisma generate
-- =============================================================================

BEGIN;

-- 1) แม่แบบ
CREATE TABLE IF NOT EXISTS pe_evaluation_template_master (
    id            BIGSERIAL PRIMARY KEY,
    master_name   VARCHAR(300) NOT NULL,
    description   TEXT,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2) หัวข้อแม่แบบ (blueprint)
CREATE TABLE IF NOT EXISTS pe_evaluation_master_head (
    id            BIGSERIAL PRIMARY KEY,
    master_id     BIGINT       NOT NULL REFERENCES pe_evaluation_template_master(id),
    head_topic    VARCHAR(500) NOT NULL,
    proportion    DECIMAL(5, 2) NOT NULL DEFAULT 0,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_master_head_master
    ON pe_evaluation_master_head (master_id);

CREATE TABLE IF NOT EXISTS pe_evaluation_master_sub (
    id              BIGSERIAL PRIMARY KEY,
    master_head_id  BIGINT       NOT NULL REFERENCES pe_evaluation_master_head(id) ON DELETE CASCADE,
    sub_topic       VARCHAR(500) NOT NULL,
    min_score       DECIMAL(8, 2) NOT NULL DEFAULT 0,
    max_score       DECIMAL(8, 2) NOT NULL DEFAULT 0,
    grade_criteria  JSONB        NOT NULL DEFAULT '[]'::jsonb,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_master_sub_head
    ON pe_evaluation_master_sub (master_head_id);

-- 3) รอบประเมิน
CREATE TABLE IF NOT EXISTS pe_evaluation_round (
    id                BIGSERIAL PRIMARY KEY,
    master_id         BIGINT       NOT NULL REFERENCES pe_evaluation_template_master(id),
    round_name        VARCHAR(300),
    evaluation_year   INT          NOT NULL,
    evaluation_period VARCHAR(10)  NOT NULL,
    start_date        DATE,
    end_date          DATE,
    status            VARCHAR(20)  NOT NULL DEFAULT 'open',
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_date      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_date      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pe_evaluation_round_master_year_period_uq
        UNIQUE (master_id, evaluation_year, evaluation_period)
);

CREATE INDEX IF NOT EXISTS idx_pe_evaluation_round_master
    ON pe_evaluation_round (master_id);

-- 4) ย้ายข้อมูลจาก pe_evaluation_template (ถ้ามี)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'pe_evaluation_template'
  ) THEN
    -- master + round ต่อแถว template เดิม (round.id = template.id)
    INSERT INTO pe_evaluation_template_master (id, master_name, active, created_date, updated_date)
    SELECT id, template_name, active, created_date, updated_date
    FROM pe_evaluation_template
    ON CONFLICT (id) DO NOTHING;

    PERFORM setval(
      pg_get_serial_sequence('pe_evaluation_template_master', 'id'),
      COALESCE((SELECT MAX(id) FROM pe_evaluation_template_master), 1)
    );

    INSERT INTO pe_evaluation_round (
        id, master_id, round_name, evaluation_year, evaluation_period,
        start_date, end_date, status, active, created_date, updated_date
    )
    SELECT
        t.id,
        t.id,
        t.template_name,
        COALESCE(EXTRACT(YEAR FROM t.start_date)::INT, EXTRACT(YEAR FROM CURRENT_DATE)::INT),
        COALESCE(NULLIF(TRIM(t.evaluation_period), ''), 'H1'),
        t.start_date,
        t.end_date,
        'open',
        t.active,
        t.created_date,
        t.updated_date
    FROM pe_evaluation_template t
    ON CONFLICT (id) DO NOTHING;

    PERFORM setval(
      pg_get_serial_sequence('pe_evaluation_round', 'id'),
      COALESCE((SELECT MAX(id) FROM pe_evaluation_round), 1)
    );

    -- blueprint จาก head/sub เดิม
    INSERT INTO pe_evaluation_master_head (master_id, head_topic, proportion, active, created_date, updated_date)
    SELECT h.pe_evaluation_template, h.head_topic, h.proportion, h.active, h.created_date, h.updated_date
    FROM pe_evaluation_head h
    WHERE h.pe_evaluation_template IS NOT NULL;

    INSERT INTO pe_evaluation_master_sub (
        master_head_id, sub_topic, min_score, max_score, grade_criteria, active, created_date, updated_date
    )
    SELECT mh.id, s.sub_topic, s.min_score, s.max_score, s.grade_criteria, s.active, s.created_date, s.updated_date
    FROM pe_evaluation_sub s
    JOIN pe_evaluation_head h ON h.id = s.pe_evaluation_head
    JOIN pe_evaluation_master_head mh
      ON mh.master_id = h.pe_evaluation_template
     AND mh.head_topic = h.head_topic
     AND mh.proportion = h.proportion;

    -- เปลี่ยน FK head: template -> round (ค่า id เดิม)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'pe_evaluation_head' AND column_name = 'pe_evaluation_template'
    ) THEN
      ALTER TABLE pe_evaluation_head
        ADD COLUMN IF NOT EXISTS pe_evaluation_round BIGINT;

      UPDATE pe_evaluation_head
      SET pe_evaluation_round = pe_evaluation_template
      WHERE pe_evaluation_round IS NULL;

      ALTER TABLE pe_evaluation_head  
        ALTER COLUMN pe_evaluation_round SET NOT NULL;

      ALTER TABLE pe_evaluation_head
        DROP CONSTRAINT IF EXISTS pe_evaluation_head_pe_evaluation_template_fkey;

      ALTER TABLE pe_evaluation_head
        ADD CONSTRAINT pe_evaluation_head_pe_evaluation_round_fkey
        FOREIGN KEY (pe_evaluation_round) REFERENCES pe_evaluation_round(id);

      ALTER TABLE pe_evaluation_head DROP COLUMN pe_evaluation_template;

      DROP INDEX IF EXISTS idx_pe_evaluation_head_template;
      CREATE INDEX IF NOT EXISTS idx_pe_evaluation_head_round
        ON pe_evaluation_head (pe_evaluation_round);
    END IF;

    -- ลบตาราง template เดิม (optional — comment ถ้ายังไม่พร้อม)
    -- DROP TABLE pe_evaluation_template;
  END IF;
END $$;

COMMIT;
