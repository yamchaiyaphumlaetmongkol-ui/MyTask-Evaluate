-- =============================================================================
-- อัปเกรด: คอลัมน์ ClickUp ที่ pm_employee
-- รัน: psql "$DATABASE_URL" -f script/sql/07_upgrade_pm_employee_clickup.sql
-- =============================================================================

ALTER TABLE pm_employee
    ADD COLUMN IF NOT EXISTS clickup_user_id   VARCHAR(50),
    ADD COLUMN IF NOT EXISTS clickup_username VARCHAR(200),
    ADD COLUMN IF NOT EXISTS clickup_email     VARCHAR(255),
    ADD COLUMN IF NOT EXISTS clickup_profile_image TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS pm_employee_clickup_user_id_uq
    ON pm_employee (clickup_user_id)
    WHERE clickup_user_id IS NOT NULL;

COMMENT ON COLUMN pm_employee.clickup_user_id IS 'รหัสผู้ใช้ ClickUp';
COMMENT ON COLUMN pm_employee.clickup_username IS 'ชื่อแสดงจาก ClickUp';
COMMENT ON COLUMN pm_employee.clickup_profile_image IS 'URL รูปโปรไฟล์ ClickUp';
