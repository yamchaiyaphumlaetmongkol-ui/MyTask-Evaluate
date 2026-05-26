-- รหัสพนักงานว่างได้ตอนนำเข้าจาก ClickUp (กำหนดทีหลังในหน้าแก้ไข)
-- รัน: psql "$DATABASE_URL" -f script/sql/08_upgrade_pm_employee_code_nullable.sql

ALTER TABLE pm_employee
    ALTER COLUMN employee_code DROP NOT NULL;

COMMENT ON COLUMN pm_employee.employee_code IS 'รหัสพนักงาน — NULL จนกว่าจะกำหนดในหน้าแก้ไข';
