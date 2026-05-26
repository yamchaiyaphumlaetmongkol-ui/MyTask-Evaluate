-- PE: ช่วงประเมิน ครึ่งแรก / ครึ่งหลัง
ALTER TABLE pe_evaluation_template
  ADD COLUMN IF NOT EXISTS evaluation_period VARCHAR(10);

COMMENT ON COLUMN pe_evaluation_template.evaluation_period IS 'ช่วงประเมิน: H1=ครึ่งแรก, H2=ครึ่งหลัง';
