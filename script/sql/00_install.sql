-- Evaluate ERP — PostgreSQL schema (รันครั้งเดียวตามลำดับ dependency)
-- จากโฟลเดอร์ script/sql:
--   psql "$DATABASE_URL" -f 00_install.sql
-- หรือรันทีละไฟล์จาก root ตามลำดับใน \ir ด้านล่าง

\ir pm_role.sql
\ir pm_positon.sql
\ir pm_employee.sql
\ir pm_role_subordinate.sql
\ir pe_evaluation_template.sql
\ir pe_evaluation_head.sql
\ir pe_evaluation_sub.sql
\ir pe_evaluation_result.sql
\ir pe_evaluation_permission.sql

-- อัปเดต updated_date อัตโนมัติเมื่อแก้ไขแถว
CREATE OR REPLACE FUNCTION set_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'pm_role',
        'pm_position',
        'pm_employee',
        'pm_role_subordinate',
        'pe_evaluation_template',
        'pe_evaluation_head',
        'pe_evaluation_sub',
        'pe_evaluation_result',
        'pe_evaluation_permission'
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
