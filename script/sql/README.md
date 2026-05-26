# SQL scripts — ลำดับการรัน (รันทีละไฟล์เอง)

หลังรัน SQL แล้ว:

```bash
cd skibidi_evaluate_project
npx prisma generate
```

---

## กรณี C — แยกแม่แบบ + รอบ

| ลำดับ | ไฟล์ | หมายเหตุ |
|------|------|----------|
| 1 | `12_upgrade_pe_template_period.sql` | ข้ามได้ถ้ามี `evaluation_period` แล้ว |
| 2 | `13_upgrade_master_round.sql` | สร้าง master/round + ย้ายข้อมูล |
| 3 | `13_verify_master_round.sql` | ตรวจผล (ทางเลือก) |

---

## กรณี A — DB ว่าง

| ลำดับ | ไฟล์ |
|------|------|
| 1 | `00_install.sql` |
| 2 | `03_upgrade_pe_permissions.sql` |
| 3 | `04_seed_pm_masters.sql` *(ทางเลือก)* |
| 4 | `05_upgrade_pe_evaluation_template.sql` *(ข้ามได้ถ้า 00 มี template แล้ว)* |
| 5 | `06_upgrade_pe_detail_result.sql` *(ข้ามถ้าไม่มี `pe_evaluation_detail`)* |
| 6 | `07_upgrade_pm_employee_clickup.sql` |
| 7 | `08_upgrade_pm_employee_code_nullable.sql` |
| 8 | `09_upgrade_pe_sub_result.sql` |
| 9 | `10_upgrade_pe_result_self_manager.sql` |
| 10 | `11_upgrade_pe_template_dates.sql` |
| 11 | `12_upgrade_pe_template_period.sql` |
| 12 | `13_upgrade_master_round.sql` |

---

## กรณี B — DB เดิม อัปเกรด 01 → 13

| ลำดับ | ไฟล์ |
|------|------|
| 1 | `01_alter_pe_created_by.sql` |
| 2 | `03_upgrade_pe_permissions.sql` |
| 3 | `04_seed_pm_masters.sql` *(ทางเลือก)* |
| 4 | `05_upgrade_pe_evaluation_template.sql` |
| 5 | `06_upgrade_pe_detail_result.sql` |
| 6 | `07_upgrade_pm_employee_clickup.sql` |
| 7 | `08_upgrade_pm_employee_code_nullable.sql` |
| 8 | `09_upgrade_pe_sub_result.sql` |
| 9 | `10_upgrade_pe_result_self_manager.sql` |
| 10 | `11_upgrade_pe_template_dates.sql` |
| 11 | `12_upgrade_pe_template_period.sql` |
| 12 | `13_upgrade_master_round.sql` |

ไม่รัน: `02_pe_permission_example.sql` (ตัวอย่าง)

---

โมเดล master/round: `docs/EVALUATION-MASTER-ROUND.md`
