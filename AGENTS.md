<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Evaluate ERP

คู่มือสำหรับ AI agent และนักพัฒนา — **practical first, ไม่ over-engineer**

---

## เป้าหมายโปรเจกต์

ERP ประเมินผลงาน แยกโมดูล **PM** (ข้อมูลพนักงาน), **PE** (แบบประเมิน), **ESS** (บริการตนเอง)  
ตอนนี้มี **shell + menu-driven navigation + empty screens** — business logic ยังไม่ implement

---

## กฎเหล็ก (ห้ามฝ่าฝืน)

| ทำ | ห้าม |
|-----|------|
| UI ด้วย **Bootstrap 5** classes | Tailwind / shadcn / MUI ในคอมโพเนนต์ใหม่ |
| Business logic ใน `src/api/{module}/{screen}/` | Logic ยาวใน `page.tsx` หรือ `src/app/api/` |
| เมนูจาก `menu.json` + `getMenu()` | Hard-code sidebar links ใน component |
| Server Actions (`"use server"`) สำหรับ mutate/read ฝั่ง server | REST route ใหม่ใน `app/api/` สำหรับ domain |
| ชื่อจอเดียวกันทั้ง `menu.id`, path, `app/`, `api/` | สะกดคนละแบบ (เช่น `esspmts` vs `esspets`) |

**Auth:** ยังไม่มี — **ห้าม** เพิ่ม `next-auth`, `(auth)/login`, middleware session, `requireSession()` จนกว่าผู้ใช้จะสั่ง  
**Trade-off:** เปิด dev ง่าย / **Risk:** ทุก action เปิดโล่งจนกว่าจะใส่ auth layer

---

## สัญญา directory (Program-Driven)

```
src/app/(main)/{module}/{screen}/page.tsx     ← UI only
src/api/{module}/{screen}/types.ts
src/api/{module}/{screen}/get_*.ts            ← read
src/api/{module}/{screen}/save_*.ts           ← write (หรือ publish_*, delete_* ตามความหมาย)
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

| Screen | Route | Actions |
|--------|-------|---------|
| pems01 | `/pe/pems01` | get_template, save_template |
| pems02 | `/pe/pems02` | get_criteria, save_criteria |
| pems03 | *(ไม่มี page)* | publish_template — **ลบหรือเพิ่ม route ให้ตรง** |

### ESS — **ชื่อจริงใน app: `esspets*`**

| Screen | Route | หมายเหตุ |
|--------|-------|----------|
| esspets01–04 | `/ess/esspets0N` | มี `page.tsx` |
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

## UI components (ใช้ของเดิมก่อนสร้างใหม่)

| โฟลเดอร์ | ใช้เมื่อ |
|----------|---------|
| `components/ui/` | Button, Input, Modal, AppLoading |
| `components/shared/` | BaseTable, FilterBar — **รับ props เท่านั้น** ไม่ fetch |
| `components/layout/` | Shell, Sidebar, Header |

**Bootstrap JS:** ต้องการ collapse/modal → มี `BootstrapScripts` ใน root layout แล้ว

---

## Client state & Hydration

- `sidebarStore` + `persist` → ค่า sidebar อาจต่าง SSR กับ client ช่วงแรก
- **ทำ:** อ่าน persisted state หลัง `useEffect` ถ้า UI สำคัญมาก (เช่น filter ที่เปลี่ยน layout)
- **ไม่ต้องทำ:** wrapper hydration ทั้งแอป — over-engineer
- `layout.tsx`: `suppressHydrationWarning` บน `<html>`/`<body>` สำหรับ browser extension

`esspmts03` (เมื่อ implement): FilterBar + `taskFilterStore` — อ่าน persist **หลัง mount** เท่านั้น

---

## Database (Prisma)

- Schema: `User`, `Employee` ใน `prisma/schema.prisma`
- **ยังไม่เชื่อม** กับ Server Actions
- **Recommendation:** implement ทีละจอ PM ก่อน (Employee CRUD) แล้วค่อย PE/ESS  
**Risk:** push schema โดยไม่มี migration strategy ใน production — ใช้ `db push` แค่ dev

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

- **[README.md](./README.md)** — ภาพรวม, checklist, tech debt
- **[src/data/README.md](./src/data/README.md)** — schema `menu.json` / `favorites.json`
