# SKILL — Evaluate ERP (Next.js App Router)

ใช้ skill นี้เมื่อแก้ UI, Server Actions, หรือโครงสร้างหน้าในโปรเจกต์นี้  
อ่าน `AGENTS.md` สำหรับกฎโปรเจกต์ — skill นี้เน้น **วิธีเขียน Next.js ที่ถูกต้อง**

**ถ้าไม่เข้าใจความต้องการ: ถามผู้ใช้จนกว่าจะเข้าใจ — อย่าเดา schema หรือ UX แล้วลงมือผิด**

---

## หลักการ (จำสั้นๆ)

1. **แสดงข้อมูล = Server Component** — โหลดใน `page.tsx` หรือ child ที่ไม่มี `"use client"`
2. **โต้ตอบ = Client แค่เกาะ** — ปุ่ม, modal, form state, `useRouter`
3. **Query แยกจาก Action** — `_queries.ts` ไม่มี `"use server"`; `save_*.ts` มี
4. **หลังบันทึก** — `revalidatePath` + `router.refresh()` ไม่ fetch list ซ้ำใน `useEffect`

---

## โครงสร้างไฟล์ต่อจอ

```
src/app/(main)/{module}/{screen}/page.tsx   ← async Server Component (โหลด + layout)
src/api/{module}/{screen}/
  _queries.ts          ← อ่าน DB (เรียกจาก page ได้)
  get_*.ts             ← "use server" ห่อ _queries (ถ้า client ต้องเรียก)
  save_*.ts            ← "use server" + Zod + revalidatePath
  types.ts
src/components/{module}/                     ← UI แยกตามโดเมน
  tables/*Table.tsx    ← Server: ตาราง HTML + Link
  *AddSection.tsx      ← Client: ปุ่ม + modal เท่านั้น
src/components/ui/                          ← ใช้ซ้ำทั้งโปรเจกต์
src/lib/prisma.ts                           ← Prisma singleton
```

---

## Server Component (`page.tsx`)

```tsx
// ไม่ใส่ "use client"
import { querySomething } from "@/api/pe/pems01/_queries";
import { PageContent } from "@/components/layout/PageContent";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ScreenPage({ searchParams }: Props) {
  const { id = "" } = await searchParams;
  let data = null;
  let loadError: string | null = null;

  try {
    data = id ? await queryById(id) : null;
  } catch (e) {
    console.error("ScreenPage", e);
    loadError = "ข้อความผู้ใช้";
  }

  return (
    <PageContent>
      {/* หัวข้อ, ลิงก์กลับ — server ได้หมด */}
      {loadError && <div className="alert alert-danger">...</div>}
      {data && <SomeTable rows={data.rows} />}
      <SomeAddSection id={id} />  {/* client island */}
    </PageContent>
  );
}
```

| ทำใน page | ห้ามใน page |
|-----------|-------------|
| `await` query / Prisma | `useState`, `useEffect` |
| `<Link href>` | `onClick` (ยกเว้นส่งผ่าน client child) |
| ส่ง props ลง table (serializable) | โหลด list ผ่าน Server Action ตอน mount |

**Dynamic:** มี `searchParams` / `params` → Next จะ render แบบ dynamic (`ƒ` ใน build)

---

## `_queries.ts` vs `get_*.ts` / `save_*.ts`

| ไฟล์ | `"use server"` | ใครเรียก |
|------|----------------|----------|
| `_queries.ts` | ไม่มี | `page.tsx`, หรือ `get_*.ts` |
| `get_*.ts` | มี | Client (เฉพาะเมื่อจำเป็น) |
| `save_*.ts` | มี | Client หลัง submit |

```ts
// _queries.ts — ตัวอย่าง
import { prisma } from "@/lib/prisma";

export async function queryEvaluationTemplates() {
  return prisma.peEvaluationTemplate.findMany({ /* ... */ });
}
```

```ts
// save_template_bundle.ts — ตัวอย่าง
"use server";
import { revalidatePath } from "next/cache";
import { fail, ok } from "@/api/_shared/action-result";

export async function saveEvaluationTemplateBundle(raw: unknown) {
  // Zod → transaction (template + heads + subs + details)
  revalidatePath("/pe/pems01");
  return ok({ templateId: "1", headIds: [] });
}
```

---

## Client island (ส่วนโต้ตอบ)

```tsx
"use client";
import { useRouter } from "next/navigation";
import { saveEvaluationTemplateBundle } from "@/api/pe/pems01/save_template_bundle";

export function EvaluationTemplateForm({ initialState, masters }) {
  const router = useRouter();
  // useState สำหรับ templateName + heads[] ...

  async function handleSave() {
    const res = await saveEvaluationTemplateBundle(payload);
    if (!res.ok) { /* แสดง error */ return; }
    router.push("/pe/pems01");
    router.refresh();
  }

  return (/* ErpCollapsePanel + HeadFormBlock */);
}
```

**ขนาด client ยิ่งเล็กยิ่งดี** — อย่าห่อทั้งหน้าใน `"use client"`

---

## ตาราง

- **รายการอ่านอย่างเดียว** → Server table (`<table>` ใน Server Component) ไม่จำเป็นต้อง `BaseTable` ถ้า column คงที่
- **คอลัมน์มี `render` แบบ interactive ซับซ้อน** → แยกคอลัมน์เป็น client เฉพาะ cell หรือใช้ `BaseTable` ใน client (หลีกเลี่ยงถ้าทำได้)

`BaseTable` ไม่มี `"use client"` — ใช้บน server ได้ถ้า `render` คืนแค่ string / Link / static button

---

## URL (PEMS01)

- แก้ไขแบบประเมิน: `?templateId=1` (ไม่ใช่ `headId`)
- ชื่อแบบ / หัวข้อโหลดจาก `_queries` บน server

---

## Form หลายระดับ (PEMS01 — implement แล้ว)

### โมเดลข้อมูล (ต้องจำ)

```
pe_evaluation_template
  └── pe_evaluation_head
        └── pe_evaluation_sub   ← grade_criteria JSON (เกณฑ์เกรด แสดงใน ESS)
              └── pe_evaluation_result   ← คะแนนต่อหัวข้อย่อย
```

### State ฝั่ง form

```ts
type EvaluationTemplateFormState = {
  templateId?: string;      // มีเมื่อแก้ไข
  templateName: string;     // ชื่อแบบประเมิน
  heads: EvaluationHeadDraft[];  // หลาย HEAD ในชุดเดียว
};
```

- **List** `/pe/pems01` → `queryEvaluationTemplates`
- **Form** `/pe/pems01/form?templateId=` → `queryTemplateFormInitial`
- **Save** `saveEvaluationTemplateBundle` — upsert template แล้วผูกทุก head กับ `pe_evaluation_template`

**UI:** ชื่อแบบประเมิน → HEAD[] → SUB → เกณฑ์เกรด (JSON) · ESS: 1 คะแนน/หัวข้อย่อย → `pe_evaluation_result`

---

## Performance / SEO / Accessibility

**อ่านก่อน implement ทุกจอ**

| หัวข้อ | ทำ |
|--------|-----|
| Performance | Server โหลดข้อมูลครั้งเดียว; client island เล็ก; ไม่ fetch ซ้ำใน `useEffect`; รูป `loading="lazy"`; filter ตารางฝั่ง client เฉพาะ list ที่โหลดแล้ว |
| SEO | ใช้ `<h1>` ต่อหน้า; `lang="th"` ใน layout; ข้อความหัวข้อเป็นข้อความจริง ไม่ใส่ในรูปอย่างเดียว |
| a11y | ปุ่มมีข้อความหรือ `aria-label`; form มี `<label>`; progress มี `role="progressbar"`; modal ปิดได้ |
| API ภายนอก | เรียก ClickUp ฝั่ง server เท่านั้น (`lib/clickup.ts`); token ใน `.env` |
| Debug API | ดู response ใน DevTools → Network (ไม่แสดง JSON บนหน้าเว็บ) |

**Layout:** header + sidebar อยู่ที่เดิม (`erp-app-frame`); scroll เฉพาะ `.erp-content` และ `.erp-sidebar-menu`

---

## Checklist ก่อนส่ง PR

- [ ] `page.tsx` เป็น Server Component (ไม่มี `"use client"` ที่ต้นไฟล์)
- [ ] ไม่มี `useEffect` โหลด list ถ้า page เป็น server ได้
- [ ] `save_*` มี `revalidatePath` ตรง route ที่แสดง list
- [ ] Client หลัง save เรียก `router.refresh()`
- [ ] Bootstrap 5 เท่านั้นใน component ใหม่
- [ ] `npm run build` ผ่าน

---

## อ้างอิงใน repo

| ตัวอย่าง | ไฟล์ |
|----------|------|
| Server page + table | `src/app/(main)/pe/pems01/page.tsx` |
| Form page | `src/app/(main)/pe/pems01/form/page.tsx` |
| Query layer | `src/api/pe/pems01/_queries.ts` |
| Bundle save | `src/api/pe/pems01/save_template_bundle.ts` |
| Client form | `src/components/pe/template-form/EvaluationTemplateForm.tsx` |
| Server table | `src/components/pe/tables/Pems01TemplateTable.tsx` |
| ESS ค้นหา (GET `?q=`) | `src/app/(main)/ess/esspets01/page.tsx` + `api/ess/esspets01/_queries.ts` |
