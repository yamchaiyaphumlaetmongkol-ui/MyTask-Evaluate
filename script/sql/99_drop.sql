-- ลบ schema ทั้งชุด (dev เท่านั้น) — รันแล้วตามด้วย install_fresh.sql
-- ใช้: psql "$DATABASE_URL" -f script/sql/99_drop.sql

DROP TABLE IF EXISTS pe_evaluation_permission      CASCADE;
DROP TABLE IF EXISTS pe_evaluation_result          CASCADE;
DROP TABLE IF EXISTS pe_evaluation_sub             CASCADE;
DROP TABLE IF EXISTS pe_evaluation_head            CASCADE;
DROP TABLE IF EXISTS pe_evaluation_round           CASCADE;
DROP TABLE IF EXISTS pe_evaluation_master_sub      CASCADE;
DROP TABLE IF EXISTS pe_evaluation_master_head     CASCADE;
DROP TABLE IF EXISTS pe_evaluation_template_master CASCADE;
DROP TABLE IF EXISTS user_identity_binding         CASCADE;
DROP TABLE IF EXISTS app_session                   CASCADE;
DROP TABLE IF EXISTS app_user_auth                 CASCADE;
DROP TABLE IF EXISTS pm_role_subordinate           CASCADE;
DROP TABLE IF EXISTS pm_employee                   CASCADE;
DROP TABLE IF EXISTS pm_position                   CASCADE;
DROP TABLE IF EXISTS pm_role                       CASCADE;

DROP FUNCTION IF EXISTS set_updated_date() CASCADE;
DROP TYPE IF EXISTS "AppAuthRole"          CASCADE;

-- ตารางเก่า (NextAuth era) — ลบทิ้งถ้าเหลือค้าง
DROP TABLE IF EXISTS pe_evaluation_detail_result CASCADE;
DROP TABLE IF EXISTS pe_evaluation_detail        CASCADE;
DROP TABLE IF EXISTS pe_evaluation_template      CASCADE;
DROP TABLE IF EXISTS verification_token          CASCADE;
DROP TABLE IF EXISTS session                     CASCADE;
DROP TABLE IF EXISTS account                     CASCADE;
DROP TABLE IF EXISTS "User"                      CASCADE;
DROP TABLE IF EXISTS "Employee"                  CASCADE;
