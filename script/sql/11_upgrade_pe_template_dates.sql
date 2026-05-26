-- PE: วันเริ่ม–สิ้นสุดของแบบประเมิน
ALTER TABLE pe_evaluation_template
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

COMMENT ON COLUMN pe_evaluation_template.start_date IS 'วันเริ่มใช้แบบประเมิน';
COMMENT ON COLUMN pe_evaluation_template.end_date IS 'วันสิ้นสุดแบบประเมิน';
