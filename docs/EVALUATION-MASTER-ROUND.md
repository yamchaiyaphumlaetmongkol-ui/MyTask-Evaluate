# แม่แบบ (Master) และรอบประเมิน (Round)

## แนวคิด

| ชั้น | ตารางหลัก | บทบาท |
|------|-----------|--------|
| **แม่แบบ** | `pe_evaluation_template_master` + `pe_evaluation_master_head/sub` | โครงสร้างคำถาม เกณฑ์เกรด สิทธิ์ role/ตำแหน่ง — แก้ได้ตลอด ไม่ผูกผลประเมิน |
| **รอบ** | `pe_evaluation_round` + `pe_evaluation_head/sub` | snapshot ตอนเปิดรอบ — ESS/ผลประเมินอ้างอิงรอบนี้ |

- **`templateId` ใน URL ESS** = **`roundId`** (คงชื่อพารามิเตอร์เดิมเพื่อไม่พังลิงก์)
- รอบซ้ำไม่ได้: `(masterId, evaluationYear, evaluationPeriod)` เป็น unique
- สถานะรอบ: `draft` | `open` | `closed` — ปิดแล้วแก้โครงสร้างรอบไม่ได้

## การย้ายข้อมูลเดิม

ลำดับรัน SQL แบบเต็ม: **`script/sql/README.md`**

```text
12_upgrade_pe_template_period.sql   (ข้ามได้ถ้ารันแล้ว)
13_upgrade_master_round.sql
13_verify_master_round.sql          (ทางเลือก)
```

จากนั้น `npx prisma generate`

แถว `pe_evaluation_template` เดิม → master + round (ใช้ id เดิมเป็น round id)

## หน้า PE

| เส้นทาง | ใช้ทำ |
|---------|--------|
| `/pe/pems01` | รายการรอบ |
| `/pe/pems01/masters` | รายการแม่แบบ |
| `/pe/pems01/master/form` | สร้าง/แก้แม่แบบ + เปิดรอบใหม่ |
| `/pe/pems01/form?templateId=` | แก้ snapshot รอบ (roundId) |

Server actions: `saveMasterBlueprint`, `createEvaluationRound`, `saveEvaluationTemplateBundle` (รอบเท่านั้น)

## ESS

- ESSPETS02/04: แสดงเฉพาะรอบ `open`/`draft` (ยังไม่ `closed`)
- สิทธิ์และผลประเมินอยู่ที่ head/sub ของรอบ — แยกจากแม่แบบหลัง snapshot
