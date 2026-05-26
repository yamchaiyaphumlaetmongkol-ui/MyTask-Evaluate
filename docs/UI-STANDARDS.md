# UI-STANDARDS.md — โครงสร้าง UI มาตรฐาน Evaluate ERP

**Agent / Cursor: อ่านไฟล์นี้ทุกครั้งก่อนแก้ UI** (หลัง `AGENTS.md` และ `docs/THEME.md`)

เป้าหมาย: ตำแหน่งข้อความ, label, field, ตาราง, ปุ่ม — **เหมือนกันทุกหน้า** ผ่านคอมโพเนนต์ `src/components/erp/`

---

## ลำดับการอ่าน

1. `AGENTS.md` — กฎโปรเจกต์
2. `docs/THEME.md` — สี, ปุ่ม, panel
3. **`docs/UI-STANDARDS.md`** (ไฟล์นี้) — โครงสร้าง layout / form / table
4. `SKILL.md` — เมื่อแตะ Next.js form ซับซ้อน

---

## โครงสร้างหน้ามาตรฐ (ESS / PE / PM)

```tsx
<PageContent>
  <ErpPageTitle>ชื่อหน้าจอ</ErpPageTitle>

  <ErpAlert variant="danger">ข้อความ error โหลดไม่สำเร็จ</ErpAlert>

  <ErpPageIntro>บรรทัดอธิบายสั้น (ถ้ามี)</ErpPageIntro>

  <ErpSearchPanel action="/path" clearHref="/path">
    {/* ช่องค้นหา — ใช้ ErpFormRow + ErpField */}
  </ErpSearchPanel>

  <ErpDataTable columns={...} data={...} rowKey={...} />

  {/* หรือเนื้อหาอื่นใน ErpPanel */}
</PageContent>
```

| ลำดับบนหน้า | คอมโพเนนต์ | ห้ามใช้แทน |
|-------------|------------|------------|
| 1 | `PageContent` | `main` เปล่าไม่มี padding |
| 2 | `ErpPageTitle` | `<h1 className="h4 mb-4">` กระจายเอง |
| 3 | `ErpAlert` (ถ้ามี) | `alert` ไม่มี `py-2` มาตรฐาน |
| 4 | `ErpPageIntro` (ถ้ามี) | `p.text-muted` คนละ margin |
| 5 | `ErpSearchPanel` / `ErpPanel` | `card` ไม่มี `erp-panel` |
| 6 | `ErpDataTable` | `<table>` + `table-light` |

---

## คอมโพเนนต์มาตรฐ (`src/components/erp/`)

นำเข้าจาก barrel:

```ts
import {
  ErpPageTitle,
  ErpPageIntro,
  ErpAlert,
  ErpPanel,
  ErpField,
  ErpSearchInput,
  ErpFormRow,
  ErpSearchPanel,
  ErpDataTable,
  ErpEmptyState,
  ErpFormActions,
} from "@/components/erp";
```

### หัวข้อและข้อความ

| คอมโพเนนต์ | ใช้เมื่อ |
|------------|----------|
| `ErpPageTitle` | หัวข้อหน้าหลัก 1 หน้า = 1 ครั้ง |
| `ErpPageIntro` | คำอธิบายใต้หัวข้อ (`text-muted small mb-3`) |
| `ErpAlert` | แจ้งเตือน `danger` / `warning` / `success` / `info` |

### กล่องและฟอร์ม

| คอมโพเนนต์ | ใช้เมื่อ |
|------------|----------|
| `ErpPanel` | กล่องเนื้อหา/ฟอร์ม (`erp-panel border-0`) |
| `ErpSearchPanel` | ฟอร์มค้นหา GET ใน panel + ปุ่มล้าง (optional) |
| `ErpFormRow` | แถว `row g-3 align-items-end` |
| `ErpField` | **label บน + control ล่าง** (ทุกช่องกรอก) |
| `ErpSearchInput` | ช่องค้นหามีไอคอนแว่นขาว |
| `ErpFormActions` | แถวปุ่มล่างฟอร์ม (ชิดขวา, gap) |

### ตาราง

| คอมโพเนนต์ | ใช้เมื่อ |
|------------|----------|
| `ErpDataTable` | ตาราง list ทุกหน้า — `thead` = `erp-table-head` |
| `ErpEmptyState` | ไม่มีข้อมูล (นอกตารางหรือแทน tbody ว่าง) |

`ErpDataTable` รองรับ:

- `showIndex` — คอลัมน์ลำดับ
- `columns[].headerClassName` / `className` — เช่น `text-center`
- `footer` — ข้อความใต้ตาราง เช่น "แสดง 5 จาก 10"

### ปุ่ม (ยังใช้ `Button` จาก `ui/`)

| งาน | class / variant |
|-----|----------------|
| ค้นหา / บันทึก / เริ่ม | `btn-success` |
| รอง / กลับ | `btn-outline-secondary` |
| ลิงก์ในตาราง | `btn-success btn-sm` หรือ `btn-outline-primary btn-sm` |

---

## กฎ Field (บังคับ)

1. **ทุกช่องมี `ErpField` + `label`** (ยกเว้น hidden)
2. **Label อยู่เหนือ control** — ไม่วาง label ข้าง input ยกเว้น checkbox เดี่ยว
3. **`htmlFor` / `id` คู่กัน** — ใช้ prefix หน้าจอ เช่น `esspets04-q`
4. **ค้นหาแบบมีไอคอน** → `ErpSearchInput` ไม่สร้าง `input-group` เอง
5. **ฟอร์มค้นหา GET ใน panel** → `ErpSearchPanel`
6. **แถวหลายคอลัมน์** → `ErpFormRow` > `col-*` > `ErpField`

### ตัวอย่างช่องค้นหา

```tsx
<ErpSearchPanel
  action="/ess/esspets04"
  method="get"
  role="search"
  clearHref={query ? "/ess/esspets04?managerCode=..." : undefined}
>
  <input type="hidden" name="managerCode" value={code} />
  <ErpPageIntro className="mb-3">ผู้ประเมิน: …</ErpPageIntro>
  <ErpFormRow>
    <div className="col-12">
      <ErpField label="ค้นหา" htmlFor="esspets04-q">
        <ErpSearchInput
          id="esspets04-q"
          name="q"
          defaultValue={query}
          placeholder="ชื่อพนักงาน รหัส หรือชื่อแบบประเมิน..."
        />
      </ErpField>
    </div>
    <div className="col-12 col-md-auto d-flex align-items-end">
      <button type="submit" className="btn btn-success">
        ค้นหา
      </button>
    </div>
  </ErpFormRow>
</ErpSearchPanel>
```

---

## กฎตาราง (บังคับ)

1. ใช้ **`ErpDataTable`** — ห้าม `thead className="table-light"`
2. คอลัมน์ **ลำดับ** → `showIndex`
3. วันที่ → `formatThaiDate` / `formatThaiDateTime`
4. ช่วงประเมิน → `formatEvaluationPeriod`
5. ปุ่มในคอลัมน์สุดท้าย → `text-center` ทั้ง header และ cell
6. ข้อความว่าง → `emptyMessage` ของตาราง หรือ `ErpEmptyState`

---

## ฟอร์มซ้อน (HEAD / SUB)

ยังใช้ **`ErpCollapsePanel`** ตาม `THEME.md` — ไม่แทนด้วย `ErpPanel`

---

## Client vs Server

| ประเภท | `"use client"` |
|--------|----------------|
| `ErpPageTitle`, `ErpDataTable`, `ErpAlert`, … | **ไม่ต้อง** (Server ได้) |
| ฟอร์มที่ `onChange` / Zustand | ใช่ — ห่อเฉพาะส่วนที่จำเป็น |

---

## Checklist ก่อน PR / จบงาน UI

- [ ] อ่าน `UI-STANDARDS.md` + `THEME.md`
- [ ] หัวข้อหน้า = `ErpPageTitle`
- [ ] ช่องกรอก = `ErpField` + label
- [ ] ตาราง = `ErpDataTable` + `erp-table-head`
- [ ] ค้นหา = `ErpSearchPanel` + `ErpSearchInput` (ถ้าเป็นหน้าค้นหา)
- [ ] ไม่มี hex / `table-light` / panel น้ำเงินใหม่

---

## ไฟล์อ้างอิง

| ไฟล์ | บทบาท |
|------|--------|
| `src/components/erp/*` | คอมโพเนนต์มาตรฐ |
| `src/components/erp/index.ts` | barrel export |
| `src/components/layout/PageContent.tsx` | padding หน้า |
| `src/components/shared/ErpCollapsePanel.tsx` | panel หุบได้ |
| `src/app/globals.css` | `.erp-form-page-title`, `.erp-table-head`, `.erp-panel` |
