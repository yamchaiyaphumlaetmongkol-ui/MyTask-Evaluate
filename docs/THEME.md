# THEME.md — Evaluate ERP (ขาว–เขียว)

เอกสารนี้เป็น **แหล่งความจริงเดียว** สำหรับสีและคลาส UI ร่วมกันทั้งแอป  
**Agent / Cursor:** อ่านก่อนแก้ UI ทุกครั้ง (หลัง `AGENTS.md`) — โครงสร้าง layout/field/ตาราง อ่านต่อที่ **[UI-STANDARDS.md](./UI-STANDARDS.md)**

---

## โทนรวม

| ชื่อ | ตัวแปร CSS | Hex | ใช้เมื่อ |
|------|------------|-----|----------|
| เขียวเข้ม | `--erp-green-dark` | `#1a5336` | หัวข้อ, แบรนด์, accent บน |
| เขียวหลัก | `--erp-green-primary` | `#2d7a5e` | ปุ่มหลัก, ลิงก์, border เน้น |
| เขียวโปรไฟล์ | `--erp-green-profile` | `#4a9072` | gradient sidebar |
| เขียว teal | `--erp-green-teal` | `#5ba491` | ข้อความรอง |
| เขียวอ่อน | `--erp-green-light` | `#e8f3ed` | พื้นหลัง panel / sidebar |
| พื้นขาวไล่ | `--erp-green-gradient-end` | `#f5faf7` | gradient จบที่ขาว |
| ขอบอ่อน | `--erp-border` | `#dce8e2` | card, panel, ตาราง |

**พื้นหลังหน้า:** `#fff` (`.erp-content`)  
**ห้าม:** สีน้ำเงิน Bootstrap ดั้งเดิม (`btn-primary` แบบ default) — override แล้วใน `globals.css`

---

## Bootstrap mapping

Override ใน `src/app/globals.css` หลัง import Bootstrap:

| Bootstrap | ค่าในโปรเจกต์ |
|-----------|----------------|
| `--bs-primary` | `--erp-green-primary` |
| `--bs-success` | `--erp-green-profile` |
| `--bs-link-color` | `--erp-green-primary` |
| `--bs-border-color` | `--erp-border` |

**ปุ่ม (ลำดับความสำคัญ):**

| งาน | Variant / class |
|-----|-----------------|
| บันทึก / ยืนยัน | `success` หรือ `btn-success` |
| เพิ่มรายการ / ดำเนินการหลัก | `primary` (โทนเขียวแล้ว) |
| ยกเลิก / กลับ | `outline-secondary` หรือ `btn-link` |
| ลบ | `danger` (คงแดง — ยกเว้น) |

**ห้าม** ใช้ `border-primary` แบบน้ำเงิน — ใช้คลาส `erp-panel` แทน

---

## คลาส ERP ที่ใช้ร่วมกัน (`globals.css`)

### Panel หุบได้ — `ErpCollapsePanel`

| คลาส | ความหมาย |
|------|----------|
| `.erp-panel` | กล่องขาว ขอบเขียวอ่อน |
| `.erp-panel--head` | ระดับ HEAD (header เขียวอ่อน) |
| `.erp-panel--sub` | ระดับ SUB (header ขาว ขอบซ้ายเขียว) |
| `.erp-panel__header` | แถบหัว + ปุ่มหุบ |
| `.erp-panel__toggle` | ปุ่มกดหุบ/กาง (chevron) |
| `.erp-panel__body` | เนื้อหา |

คอมโพเนนต์: `src/components/shared/ErpCollapsePanel.tsx`  
**ทุกบล็อกฟอร์มซ้อน (HEAD / SUB)** ใช้ตัวนี้ — หุบได้, ค่าเริ่ม `defaultOpen={true}`

### อื่นๆ

| คลาส | ใช้เมื่อ |
|------|----------|
| `.erp-page-content` | padding หน้า (ผ่าน `PageContent`) |
| `.erp-table-head` | `<thead>` ตารางในฟอร์ม |
| `.text-erp-primary` | ข้อความสีเขียวหลัก |

---

## Layout shell (มีอยู่แล้ว)

- `.erp-top-accent` — แถบเขียวเข้มบนสุด
- `.erp-header` — header ขาว
- `.erp-sidebar` — gradient ขาว–เขียวอ่อน
- เมนู active: พื้นขาว + ตัวอักษร `--erp-green-dark`

---

## Checklist ก่อนเพิ่ม UI ใหม่

1. อ่าน **[UI-STANDARDS.md](./UI-STANDARDS.md)** — ใช้ `ErpPageTitle`, `ErpField`, `ErpDataTable`, `ErpSearchPanel`
2. ใช้ตัวแปร `--erp-green-*` หรือคลาส `erp-*` — **ไม่ hard-code hex ใหม่** ยกเว้นใน `globals.css`
3. ปุ่มหลัก / บันทึก → `success` หรือ `primary` (ทั้งคู่เป็นเขียว)
4. การ์ดฟอร์มซ้อน → `ErpCollapsePanel` + `level="head" | "sub"`
5. ตาราง list → `ErpDataTable` (`erp-table-head`)
6. ไม่เพิ่ม Tailwind / MUI

---

## ไฟล์อ้างอิง

- `docs/UI-STANDARDS.md` — โครงสร้างหน้าและคอมโพเนนต์มาตรฐ
- `src/components/erp/` — `ErpPageTitle`, `ErpField`, `ErpDataTable`, …
- `src/app/globals.css` — ตัวแปร + override Bootstrap + คลาส panel
- `src/components/shared/ErpCollapsePanel.tsx`
- `src/components/ui/Button.tsx` — variant ที่อนุญาต
