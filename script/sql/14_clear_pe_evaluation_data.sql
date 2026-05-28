-- Clear PE evaluation data (hard reset)
-- ใช้ใน production ด้วยความระมัดระวัง: ลบข้อมูลประเมินทั้งหมดถาวร

BEGIN;

DELETE FROM pe_evaluation_result;
DELETE FROM pe_evaluation_permission;
DELETE FROM pe_evaluation_sub;
DELETE FROM pe_evaluation_head;
DELETE FROM pe_evaluation_round;
DELETE FROM pe_evaluation_master_sub;
DELETE FROM pe_evaluation_master_head;
DELETE FROM pe_evaluation_template_master;

-- reset identity sequences
ALTER SEQUENCE pe_evaluation_result_id_seq RESTART WITH 1;
ALTER SEQUENCE pe_evaluation_permission_id_seq RESTART WITH 1;
ALTER SEQUENCE pe_evaluation_sub_id_seq RESTART WITH 1;
ALTER SEQUENCE pe_evaluation_head_id_seq RESTART WITH 1;
ALTER SEQUENCE pe_evaluation_round_id_seq RESTART WITH 1;
ALTER SEQUENCE pe_evaluation_master_sub_id_seq RESTART WITH 1;
ALTER SEQUENCE pe_evaluation_master_head_id_seq RESTART WITH 1;
ALTER SEQUENCE pe_evaluation_template_master_id_seq RESTART WITH 1;

COMMIT;
