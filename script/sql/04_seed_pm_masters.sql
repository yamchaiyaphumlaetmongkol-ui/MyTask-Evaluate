-- ข้อมูลตัวอย่าง role / ตำแหน่ง (สำหรับ modal เลือกสิทธิ์)
INSERT INTO pm_role (role_code, role_name, role_level, active)
VALUES
  ('R01', 'พนักงาน', 1, TRUE),
  ('R02', 'หัวหน้างาน', 2, TRUE),
  ('R03', 'ผู้จัดการ', 3, TRUE),
  ('R04', 'HR', 4, TRUE)
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO pm_position (position_code, position_name, active)
VALUES
  ('P01', 'โปรแกรมเมอร์', TRUE),
  ('P02', 'นักวิเคราะห์', TRUE),
  ('P03', 'หัวหน้าทีม', TRUE),
  ('P04', 'ผู้จัดการฝ่าย', TRUE)
ON CONFLICT (position_code) DO NOTHING;
