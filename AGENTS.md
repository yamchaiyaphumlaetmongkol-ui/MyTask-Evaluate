<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Evaluate ERP

คู่มือสำหรับ AI agent และนักพัฒนา — **practical first, ไม่ over-engineer**

---

## อ่านก่อนแตะโค้ด (บังคับสำหรับ Cursor / Agent)

**ลำดับ:** ไฟล์นี้ (`AGENTS.md`) → **[docs/THEME.md](./docs/THEME.md)** → **[docs/UI-STANDARDS.md](./docs/UI-STANDARDS.md)** → [SKILL.md](./SKILL.md) (เมื่อแตะ Next.js / form array)

| หัวข้อ | ไฟล์ |
|--------|------|
| กฎโปรเจกต์, directory, ห้ามทำ | `AGENTS.md` (นี่) |
| **สี ขาว–เขียว, ปุ่ม, panel หุบได้** | **`docs/THEME.md`** |
| **โครงสร้างหน้า, field, ตาราง, คอมโพเนนต์ซ้ำ** | **`docs/UI-STANDARDS.md`** |
| RSC, Server Actions, PEMS01 form | `SKILL.md` |

**UI ใหม่:** ใช้โทน `--erp-green-*`, คอมโพเนนต์ **`src/components/erp/`** (`ErpPageTitle`, `ErpField`, `ErpDataTable`, …) และ `ErpCollapsePanel` — **ห้าม** สีน้ำเงิน Bootstrap ดั้งเดิม / Tailwind / MUI / `<table className="table-light">`

**ถ้าไม่เข้าใจความต้องการ (โดยเฉพาะโมเดลข้อมูล / UX): ถามผู้ใช้จนกว่าจะเข้าใจ — อย่าเดาแล้ว implement ผิดโครงสร้าง**

---

## เป้าหมายโปรเจกต์

ERP ประเมินผลงาน แยกโมดูล **PM** (ข้อมูลพนักงาน), **PE** (แบบประเมิน), **ESS** (บริการตนเอง)  
ตอนนี้มี **shell + menu-driven navigation + empty screens** — business logic ยังไม่ implement

---

## กฎเหล็ก (ห้ามฝ่าฝืน)

| ทำ | ห้าม |
|-----|------|
| UI ด้วย **Bootstrap 5** + โทน **[docs/THEME.md](./docs/THEME.md)** | Tailwind / shadcn / MUI ในคอมโพเนนต์ใหม่ |
| ฟอร์มซ้อน → **`ErpCollapsePanel`** (หุบได้) | การ์ด `border-primary` น้ำเงิน / panel ไม่มี theme |
| Business logic ใน `src/api/{module}/{screen}/` | Logic ยาวใน `page.tsx` หรือ `src/app/api/` |
| เมนูจาก `menu.json` + `getMenu()` | Hard-code sidebar links ใน component |
| Server Actions (`"use server"`) สำหรับ mutate/read ฝั่ง server | REST route ใหม่ใน `app/api/` สำหรับ domain |
| ชื่อจอเดียวกันทั้ง `menu.id`, path, `app/`, `api/` | สะกดคนละแบบ (เช่น `esspmts` vs `esspets`) |

**Auth:** ยังไม่มี — **ห้าม** เพิ่ม `next-auth`, `(auth)/login`, middleware session, `requireSession()` จนกว่าผู้ใช้จะสั่ง  
**Trade-off:** เปิด dev ง่าย / **Risk:** ทุก action เปิดโล่งจนกว่าจะใส่ auth layer

---

## Next.js App Router — รูปแบบที่ใช้ในโปรเจกต์

อ่านรายละเอียดเต็มใน **[SKILL.md](./SKILL.md)**

| ชั้น | ใส่ `"use client"`? | ตัวอย่าง |
|------|---------------------|----------|
| `page.tsx` | **ไม่** | `async` โหลดจาก `_queries.ts` แล้ว render |
| `components/.../tables/*` | **ไม่** | `<table>` + `Link` + ข้อความจาก props |
| `components/.../*AddSection` | **ใช่** | ปุ่ม + modal + `router.refresh()` |
| `api/.../_queries.ts` | **ไม่** | Prisma อ่านอย่างเดียว |
| `api/.../save_*.ts` | **`"use server"`** | Zod + `revalidatePath` |

**ห้าม:** ห่อทั้งหน้าจอใน client แล้ว `useEffect` เรียก `get_*` โหลด list — ให้ server โหลดครั้งเดียวตอนเปิดหน้า

**URL:** ส่งเฉพาะ id ใน query (`?headId=1`) — ชื่อหัวข้อดึงจาก DB บน server

---

## สัญญา directory (Program-Driven)

```
src/app/(main)/{module}/{screen}/page.tsx     ← Server Component (โหลด + จัด layout)
src/api/{module}/{screen}/
  _queries.ts                                 ← อ่าน DB (ไม่มี "use server")
  get_*..ts                                    ← ห่อ _queries สำหรับ client (ถ้าจำเป็น)
  save_*.ts                                     ← mutate + revalidatePath
  types.ts
src/components/{module}/
  tables/                                     ← Server tables
  *AddSection.tsx / *Form.tsx                 ← Client islands
```

`{module}` = `pm` | `pe` | `ess`  
`{screen}` = รหัสจอ lowercase เช่น `pmms01`, `esspets03` (ต้องตรง `menu.json` id)

### เมนู (`src/data/menu.json`)

| type | path | พฤติกรรม |
|------|------|----------|
| `folder` | `null` | กดหุบ/กางลูกใน sidebar เท่านั้น |
| `page` | `/module/screen` | `<Link>` ไป route |

เพิ่มจอ = แถวใน JSON + `page.tsx` + โฟลเดอร์ `api` (เมื่อพร้อม) — ดู checklist ใน README

### รายการโปรด (`src/data/favorites.json`)

- แถว `{ menuId, sortOrder }` — `menuId` ต้องเป็น **page** ที่มีใน `menu.json`
- Resolve ใน `resolve-favorites.ts` — id ผิด = เงียบๆ ไม่แสดง (**Risk:** คิดว่า bug ใน UI แต่จริงๆ ข้อมูลผิด)

---

## Layout & Navigation (รู้จักไฟล์นี้)

| ไฟล์ | บทบาท |
|------|--------|
| `app/(main)/layout.tsx` | `getMenu()` → `MainShell` (Header + Sidebar) |
| `app/page.tsx` | หน้า `/` — โหลด `getMenu()` เอง (ซ้ำกับ layout แต่ยังไม่รวม route group) |
| `components/layout/MainShell.tsx` | client shell |
| `components/layout/SidebarMenuTree.tsx` | tree เมนูหลัก |
| `components/layout/SidebarFavoritesList.tsx` | แท็บรายการโปรด |
| `store/sidebarStore.ts` | collapsed, expandedItemIds, menuTab — **persist localStorage** |
| `api/navigation/get_menu.ts` | รวม menu + favorites |

**Loading:** `AppLoading` + `loading.tsx` ใช้ `/loading.gif`

**Recommendation:** หน้าใหม่ทั้งหมดอยู่ใต้ `(main)/` — ลดการ duplicate `getMenu()` ที่ `app/page.tsx` เมื่อ refactor ครั้งถัดไป  
**Trade-off:** ย้าย `/` เข้า `(main)` = เปลี่ยน URL structure เล็กน้อย

---

## จอที่มี route แล้ว (อ้างอิงเมื่อ implement)

### PM — `src/api/pm/` (placeholder)

| Screen | Route | Actions (ตั้งชื่อแล้ว) |
|--------|-------|----------------------|
| pmms01 | `/pm/pmms01` | get_emp, save_emp |
| pmms02 | `/pm/pmms02` | get_role, save_role |
| pmms03 | `/pm/pmms03` | get_position, save_position |
| pmms04 | `/pm/pmms04` | *(ยังไม่มีไฟล์ api — สร้างเมื่อ implement)* |

### PE — `src/api/pe/`

| Screen | Route | โครงสร้างปัจจุบัน |
|--------|-------|-------------------|
| pems01 | `/pe/pems01?q=` | รายการแบบประเมิน + ค้นหาชื่อ (Server GET) |
| pems01 | `/pe/pems01/form` | สร้างแบบประเมิน — ชื่อ + HEAD หลายรายการ + SUB + DETAIL |
| pems01 | `/pe/pems01/form?templateId=` | แก้ไขแบบประเมิน (โหลด HEAD ทั้งหมดในชุด) |
| pems02 | `/pe/pems02` | get_criteria, save_criteria (placeholder) |
| pems03 | *(ไม่มี page)* | publish_template — **ลบหรือเพิ่ม route ให้ตรง** |

**Actions (pems01):** `_queries.ts`, `save_template_bundle.ts`, `_permission.ts`

#### PEMS01 — โมเดลข้อมูล (สำคัญ)

```
pe_evaluation_template
  └── pe_evaluation_head
        └── pe_evaluation_sub   ← grade_criteria (JSON เกณฑ์เกรด แสดงใน ESS) + min/max คะแนน
              └── pe_evaluation_result   ← แถวเดียวต่อ sub+พนักงาน
                    self_score, self_detail (ESSPETS02)
                    manager_score, manager_detail (ESSPETS04)
```

- **grade_criteria** บน `pe_evaluation_sub` = เงื่อนไขเกรด (แสดงใน ESS)
- **pe_evaluation_result** = คอลัมน์ self_* และ manager_* ในแถวเดียว
- อัปเกรด DB: `09_upgrade_pe_sub_result.sql`, `10_upgrade_pe_result_self_manager.sql`

- **แบบประเมิน** = ชุดที่รวมหัวข้อหลัก (HEAD) หลายอัน
- หน้า form: ชื่อแบบประเมิน + HEAD[] + SUB + เกณฑ์เกรด → `save_template_bundle`
- SQL ใหม่: `script/sql/pe_evaluation_template.sql`, อัปเกรด: `05_upgrade_pe_evaluation_template.sql`

#### PEMS01 — form (implement แล้ว)

- List: `Pems01TemplateTable` · Form: `EvaluationTemplateForm` + `ErpCollapsePanel`
- Query: `queryEvaluationTemplates`, `queryTemplateFormInitial(templateId?)`
- สิทธิ์ role/ตำแหน่ง: ที่ **head** เท่านั้น
- v1: ลบแถวออกจากฟอร์มยังไม่ลบใน DB

### ESS — **ชื่อจริงใน app: `esspets*`**

| Screen | Route | หมายเหตุ |
|--------|-------|----------|
| esspets01 | `/ess/esspets01?q=` | ค้นหาแบบประเมิน → esspets02 |
| esspets02 | `/ess/esspets02?templateId=&employeeCode=` | self_score / self_detail |
| esspets03 | `/ess/esspets03?q=` | ติดตามสถานะ — list หัวข้อหลัก → `?headId=&employeeCode=` ดูคะแนนแต่ละ sub |
| esspets04 | `/ess/esspets04?managerCode=&q=` | ตารางผู้ self แล้ว → manager_score / manager_detail |
| esspmts01–03 | — | โฟลเดอร์ `api/ess/esspmts*` **ล้าสมัย** — rename เป็น `esspets*` ก่อน implement |

---

## Server Action (เมื่อ implement จริง)

ลำดับที่แนะนำ — ไม่ต้องใส่ abstraction เพิ่มจนกว่าจอที่ 3 ซ้ำ pattern:

1. `"use server"` ที่ต้นไฟล์
2. Zod validate input ใน `save_*`
3. Return `ActionResult<T>` (สร้าง type ใน `api/_shared/` เมื่อจอแรกที่ใช้)
4. Prisma ผ่าน client เดียว (สร้าง `lib/prisma.ts` ครั้งเดียว)
5. **ยังไม่ใส่** session check จนมี auth

```ts
// รูปแบบที่คาดหวัง — ไม่บังคับ framework เพิ่ม
"use server";
import { z } from "zod";

const Input = z.object({ /* ... */ });

export async function saveSomething(raw: unknown) {
  const input = Input.parse(raw);
  // prisma / business rules
  return { ok: true as const, data: input };
}
```

**Trade-off:** Server Actions ต่อจอ = ง่ายต่อ debug / **Risk:** ไม่มี centralized audit log จนกว่าจะแยก `_shared` logger

---

## UI & Theme (ขาว–เขียว)

**อ่านเต็ม:** [docs/THEME.md](./docs/THEME.md)

| รายการ | ที่อยู่ |
|--------|---------|
| ตัวแปรสี `--erp-green-*` | `src/app/globals.css` |
| Override Bootstrap primary/success | `globals.css` (`:root`) |
| Panel หุบได้ | `components/shared/ErpCollapsePanel.tsx` + `.erp-panel*` |

| โฟลเดอร์ | ใช้เมื่อ |
|----------|---------|
| `components/ui/` | Button, Input, Modal, AppLoading |
| `components/shared/` | BaseTable, FilterBar, **ErpCollapsePanel** |
| `components/layout/` | Shell, Sidebar, Header |

**ปุ่ม:** บันทึก/เพิ่ม → `success` หรือ `primary` (ทั้งคู่เป็นเขียวหลัง override) · ลบ → `danger`  
**Bootstrap JS:** modal ใน root layout (`BootstrapScripts`) — panel หุบใช้ state ใน `ErpCollapsePanel` ไม่พึ่ง collapse JS

---

## Client state & Hydration

- `sidebarStore` + `persist` → ค่า sidebar อาจต่าง SSR กับ client ช่วงแรก
- **ทำ:** อ่าน persisted state หลัง `useEffect` ถ้า UI สำคัญมาก (เช่น filter ที่เปลี่ยน layout)
- **ไม่ต้องทำ:** wrapper hydration ทั้งแอป — over-engineer
- `layout.tsx`: `suppressHydrationWarning` บน `<html>`/`<body>` สำหรับ browser extension

`esspmts03` (เมื่อ implement): FilterBar + `taskFilterStore` — อ่าน persist **หลัง mount** เท่านั้น

---

## Database (Prisma)

- Schema: `prisma/schema.prisma` — `pm_*`, `pe_*` ตรง `script/sql/`
- Client: `src/lib/prisma.ts`
- อ่าน: `_queries.ts` จาก Server page
- เขียน: `save_*.ts` + `revalidatePath`
- SQL ติดตั้ง: `script/sql/00_install.sql`, อัปเกรด: `03_upgrade_pe_permissions.sql`
- **Risk:** production ควรมี migration strategy — dev ใช้ `db push` / psql script

---

## สิ่งที่ Agent ห้ามทำ (over-engineering)

- สร้าง generic CRUD framework / plugin menu / DI container
- แยก microservice หรือ BFF ก่อน monolith นี้ทำงานได้
- ใส่ React Query ทั้งแอปเมื่อ Server Actions พอ
- Generate menu จาก filesystem แทน JSON — ได้ความอัตโนมัติแต่เสียการ sync กับ DB อนาคต

---

## ก่อน commit / PR

```bash
npm run build
npm run lint
```

ตรวจ: แถว `menu.json` ตรง path, `favorites.menuId` มีจริง, ไม่ commit `.env`

---

## เอกสารเพิ่ม

- **[docs/THEME.md](./docs/THEME.md)** — โทนขาว–เขียว, ปุ่ม, panel, checklist UI
- **[SKILL.md](./SKILL.md)** — ลักษณะการเขียน Next.js + แบบ form array PEMS01
- **[README.md](./README.md)** — ภาพรวม, checklist, tech debt
- **[src/data/README.md](./src/data/README.md)** — schema `menu.json` / `favorites.json`
