-- ลบ schema ทั้งชุด (ลำดับย้อน FK) — ใช้เฉพาะ dev
-- ใช้: psql "$DATABASE_URL" -f script/sql/99_drop.sql

DROP TABLE IF EXISTS pe_evaluation_permission CASCADE;
DROP TABLE IF EXISTS pe_evaluation_result CASCADE;
DROP TABLE IF EXISTS pe_evaluation_detail_result CASCADE;
DROP TABLE IF EXISTS pe_evaluation_detail CASCADE;
DROP TABLE IF EXISTS pe_evaluation_sub CASCADE;
DROP TABLE IF EXISTS pe_evaluation_head CASCADE;
DROP TABLE IF EXISTS pe_evaluation_template CASCADE;
DROP TABLE IF EXISTS pm_role_subordinate CASCADE;
DROP TABLE IF EXISTS pm_employee CASCADE;
DROP TABLE IF EXISTS pm_position CASCADE;
DROP TABLE IF EXISTS pm_role CASCADE;

DROP FUNCTION IF EXISTS set_updated_date() CASCADE;
