-- ตรวจหลังรัน 13_upgrade_master_round.sql (อ่านผลอย่างเดียว — ไม่แก้ข้อมูล)

\echo '=== ตาราง master / round ==='
SELECT
  (SELECT COUNT(*) FROM pe_evaluation_template_master) AS master_count,
  (SELECT COUNT(*) FROM pe_evaluation_round) AS round_count,
  (SELECT COUNT(*) FROM pe_evaluation_master_head) AS blueprint_head_count,
  (SELECT COUNT(*) FROM pe_evaluation_master_sub) AS blueprint_sub_count;

\echo '=== head ยังชี้ round (ไม่มี pe_evaluation_template) ==='
SELECT
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pe_evaluation_head'
      AND column_name = 'pe_evaluation_round'
  ) AS has_round_column,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pe_evaluation_head'
      AND column_name = 'pe_evaluation_template'
  ) AS still_has_old_template_column;

\echo '=== จำนวน head ต่อ round (ควร > 0 ถ้ามีแบบประเมินเดิม) ==='
SELECT r.id AS round_id, r.round_name, COUNT(h.id) AS head_count
FROM pe_evaluation_round r
LEFT JOIN pe_evaluation_head h ON h.pe_evaluation_round = r.id AND h.active
GROUP BY r.id, r.round_name
ORDER BY r.id
LIMIT 20;

\echo '=== template เดิม (ยังมีได้ — ลบทีหลังใน 13 ถ้า uncomment DROP) ==='
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'pe_evaluation_template'
) AS legacy_template_table_exists;
