# Evaluate — ERP (Program-Driven)

Next.js 16 App Router + Bootstrap 5 สำหรับระบบประเมินผลงานหลายโมดูล (**PM / PE / ESS**)

**สถานะปัจจุบัน:** โครง shell + เมนู + routing พร้อมแล้ว — Server Actions และ DB ยังเป็น placeholder

---

## เริ่มต้น

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # ตรวจ TypeScript + static generation ก่อน merge
```

| คำสั่ง | ใช้เมื่อ |
|--------|---------|
| `npm run db:generate` | แก้ `prisma/schema.prisma` แล้ว generate client |
| `npm run db:push` | sync schema ไป PostgreSQL (dev เท่านั้น) |
| `npm run lint` | ก่อน commit |

**Prisma:** ต้องมี `DATABASE_URL` ใน `.env` ก่อนรัน db commands — ยังไม่ถูกเรียกจากหน้าจอ

---

## สถาปัตยกรรม (ตัดสินใจแล้ว)

### หลัก: หนึ่งจอ = สามที่ (ต้องตรงชื่อ)

| ชั้น | ที่อยู่ | หน้าที่ |
|------|---------|--------|
| **Route** | `src/app/(main)/{module}/{screen}/page.tsx` | UI เท่านั้น — เรียก Server Action, ไม่มี business logic |
| **Logic** | `src/api/{module}/{screen}/` | `get_*.ts`, `save_*.ts`, `types.ts` — domain + data |
| **เมนู** | `src/data/menu.json` | แถว flat → tree ใน sidebar (`getMenu`) |

**Trade-off:** ต้อง sync 3 จุดด้วยมือ — **ได้ความชัดเจนและค้นหาง่าย** ไม่ต้องพึ่ง code-gen  
**Risk:** ลืมเพิ่มแถวใน `menu.json` → หน้าเปิดได้แต่ไม่ขึ้นเมนู / `favorites.json` ชี้ `menuId` ผิด → ไม่แสดงในรายการโปรด

### สิ่งที่ไม่ทำ (ตอนนี้)

- Login / session / middleware auth
- REST `app/api/*` สำหรับ domain (ใช้ Server Actions ใน `src/api/` เท่านั้น)
- Tailwind สำหรับ UI ใหม่ (Bootstrap 5 + `globals.css` เท่านั้น)

---

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── layout.tsx, page.tsx, loading.tsx   # หน้าแรก / โหลดเต็มจอ
│   ├── globals.css                         # ERP theme + Bootstrap import
│   └── (main)/
│       ├── layout.tsx                      # getMenu() → MainShell
│       ├── loading.tsx                     # loading.gif ใน content area
│       ├── pm/   pmms01 … pmms04
│       ├── pe/   pems01, pems02
│       └── ess/  esspets01 … esspets04
├── api/
│   ├── navigation/                         # get_menu, build tree, favorites
│   ├── pm/, pe/, ess/                      # placeholder Server Actions
│   └── (screen)/types.ts, get_*.ts, save_*.ts
├── data/
│   ├── menu.json                           # แหล่งเมนู (mock DB)
│   ├── favorites.json                      # รายการโปรด (อ้าง menuId)
│   └── README.md                           # schema แถวเมนู/โปรด
├── components/
│   ├── layout/   AppHeader, Sidebar, MainShell, …
│   ├── ui/       Button, Input, Modal, AppLoading
│   ├── shared/   BaseTable, FilterBar
│   └── providers/ BootstrapScripts
├── store/        sidebarStore (persist), taskFilterStore
└── lib/          app-config, navigation helpers, api-clients
public/
  loading.gif, logo*.png/gif
prisma/schema.prisma   # User, Employee — ยังไม่เชื่อมหน้าจอ
```

---

## Navigation

| แหล่ง | ไฟล์ | โหลดที่ |
|-------|------|---------|
| เมนูหลัก | `src/data/menu.json` | `(main)/layout.tsx` → `getMenu()` |
| รายการโปรด | `src/data/favorites.json` | รวมใน `getMenu()` → `menu.favorites` |
| Sidebar state | `sidebarStore` (localStorage) | หุบ sidebar / กาง folder / แท็บเมนู |

**พฤติกรรม folder:** `type: "folder"` + `path: null` → กดแล้วหุบ/กางลูกเท่านั้น ไม่ navigate  
**รายละเอียดคอลัมน์:** ดู `src/data/README.md`

---

## Routes ปัจจุบัน

| Module | Screens (มี `page.tsx`) |
|--------|-------------------------|
| `/` | หน้าแรก (อยู่นอก `(main)` แต่ใช้ `MainShell` เหมือนกัน) |
| PM | `pmms01`–`pmms04` |
| PE | `pems01`, `pems02` |
| ESS | `esspets01`–`esspets04` |

---

## เพิ่มจอใหม่ (checklist)

1. **`menu.json`** — แถว `type: "page"`, `path: "/{module}/{screen}"`, `parentId` ชี้ folder
2. **`src/app/(main)/{module}/{screen}/page.tsx`** — shell ว่างหรือฟอร์ม
3. **`src/api/{module}/{screen}/`** — `types.ts`, `get_*.ts`, `save_*.ts` (เมื่อมี logic)
4. **(ถ้าต้องการ)** แถวใน `favorites.json` ด้วย `menuId` = `id` ในเมนู
5. **`npm run build`** — จับ path ผิด / type พัง

**Screen code ต้องตรงกันทุกที่** — ตัวอย่าง: `esspets03` ไม่ใช่ `esspmts03` ใน path หรือโฟลเดอร์ `api/`

---

## UI & Loading

- **Bootstrap 5** + **Bootstrap Icons** — import ใน `globals.css`, JS ผ่าน `BootstrapScripts`
- **Loading:** `public/loading.gif` ผ่าน `AppLoading` + `app/loading.tsx`, `app/(main)/loading.tsx`
- **Theme:** CSS variables ใน `globals.css` (`--erp-green-*`)

---

## State (Zustand)

| Store | Persist | ใช้กับ |
|-------|---------|--------|
| `sidebarStore` | ใช่ (collapsed, expanded folders) | Sidebar, Header |
| `taskFilterStore` | ตาม implementation | ESS filter (เมื่อ implement) |

**Risk:** ค่าจาก `localStorage` ทำให้ hydration warning ได้ — layout ใส่ `suppressHydrationWarning` ที่ `<body>` แล้ว; extension เบราว์เซอร์ (เช่น `cz-shortcut-listen`) ก็ทำให้เกิด warning ได้

---

## Tech debt ที่รู้ (ควรแก้ก่อน implement จริง)

| ปัญหา | แนะนำ |
|--------|--------|
| `src/api/ess/esspmts*` ไม่ตรง `app/.../esspets*` | เปลี่ยนชื่อโฟลเดอร์ `api` ให้ตรง `esspets{NN}` |
| `favorites.json` มี `esspmts01` | แก้เป็น `esspets01` (หรือ id ที่มีใน menu) |
| `api/pe/pems03` มีแต่ไม่มี route/menu | ลบหรือเพิ่มหน้า + menu ให้ครบ |
| Server Actions ทุกไฟล์เป็น `export {}` | implement ทีละจอเมื่อมี schema จริง |

---

## สำหรับ Agent / นักพัฒนา

อ่าน **[AGENTS.md](./AGENTS.md)** — กฎ hard/soft, template Server Action, สิ่งที่ห้ามทำ

**Next.js 16:** มี breaking changes จากเวอร์ชันเก่า — อ่าน `node_modules/next/dist/docs/` ก่อนใช้ API ใหม่
