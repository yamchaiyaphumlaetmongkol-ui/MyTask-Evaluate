# MyPerformanceV2 — ระบบประเมินผลงาน

Next.js 16 · Bootstrap 5 · Prisma · PostgreSQL (Neon) · Deploy บน Vercel

---

## เข้าสู่ระบบครั้งแรก

| ช่อง           | ค่า          |
| -------------- | ------------ |
| **ชื่อผู้ใช้** | `admin`      |
| **รหัสผ่าน**   | `Admin1234*` |

> **หมายเหตุ:** บัญชี `admin` เป็น super-user ไม่ผูกกับพนักงาน ใช้สำหรับจัดการระบบ
> พนักงานทั่วไปใช้ **อีเมล ClickUp** เป็น username และ `P@ssword` เป็นรหัสผ่านเริ่มต้น (ระบบจะบังคับเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก)

---

## Environment Variables

สร้างไฟล์ `.env.local` แล้วใส่ค่าตามนี้:

```env
# Database (Prisma) — ใช้ pooled URL จาก Neon
DATABASE_URL='postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require'

# Session secret — สำหรับ sign cookie (บังคับบน production)
# สร้างด้วย: node -e "require('crypto').randomBytes(32).toString('base64')|0" หรือ openssl rand -base64 32
SESSION_SECRET='your-random-secret-here'

# ClickUp API
CLICKUP_API_TOKEN="pk_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx"
CLICKUP_TEAM_ID="9xxxxxxxxx"
```

### วิธีหา ClickUp API Token

1. เปิด **ClickUp** → คลิกรูปโปรไฟล์มุมซ้ายล่าง
2. เลือก **Settings**
3. เลื่อนลงหา **Apps** ในเมนูซ้าย
4. คลิก **Generate** ใต้หัวข้อ **API Token**
5. Copy token ที่ขึ้นต้นด้วย `pk_`

### วิธีหา ClickUp Team ID

1. เปิด ClickUp → เลือก Workspace ที่ต้องการ
2. ดู URL: `https://app.clickup.com/**9xxxxxxxxx**/...` — ตัวเลขนั้นคือ Team ID
3. หรือไปที่ Settings → Workspace → ดูใน URL

---

## รัน Local

```bash
npm install
npm run dev       # http://localhost:3000
```

**ก่อนรัน:** ต้องมี `.env.local` + ฐานข้อมูลมี tables ครบ (ดู [ติดตั้ง Database](#ติดตั้ง-database))

| คำสั่ง                | ใช้เมื่อ                                        |
| --------------------- | ----------------------------------------------- |
| `npm run build`       | ตรวจ TypeScript + build ก่อน deploy             |
| `npm run lint`        | ก่อน commit                                     |
| `npm run db:generate` | แก้ `prisma/schema.prisma` แล้ว generate client |
| `npm run db:push`     | sync schema ไป DB (dev เท่านั้น)                |

---

## ติดตั้ง Database

รัน SQL scripts ตามลำดับใน `script/sql/`:

```bash
# ติดตั้งครั้งแรก
psql $DATABASE_URL -f script/sql/00_install.sql

# อัปเกรด (เรียงตามเลข)
psql $DATABASE_URL -f script/sql/01_alter_pe_created_by.sql
# ... ต่อจนถึง
psql $DATABASE_URL -f script/sql/17_upgrade_app_auth.sql
```

> ไฟล์ `17_upgrade_app_auth.sql` สร้างตาราง `app_user_auth` และ `app_session` ที่จำเป็นสำหรับระบบ login

---

## Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. Import project ใน [vercel.com](https://vercel.com)
3. ตั้ง **Environment Variables** ใน Vercel Dashboard:

| Key                 | ค่า                                  |
| ------------------- | ------------------------------------ |
| `DATABASE_URL`      | Neon pooled URL + `?sslmode=require` |
| `SESSION_SECRET`    | random string 32+ bytes              |
| `CLICKUP_API_TOKEN` | `pk_xxxxx` จาก ClickUp Settings      |
| `CLICKUP_TEAM_ID`   | Team ID จาก ClickUp URL              |

4. Deploy → ระบบจะรัน `prisma generate && next build` อัตโนมัติ

---

## โมดูล

| Module                 | Path                         | ใช้งาน                                  |
| ---------------------- | ---------------------------- | --------------------------------------- |
| **PM** — ข้อมูลพนักงาน | `/pm/pmms01`–`pmms04`        | จัดการพนักงาน, roles, ตำแหน่ง           |
| **PE** — แบบประเมิน    | `/pe/pems01`–`pems02`        | สร้างและจัดการแบบประเมิน                |
| **ESS** — บริการตนเอง  | `/ess/esspets01`–`esspets04` | ประเมินตนเอง, ติดตาม, ผู้จัดการให้คะแนน |

---

## โครงสร้างโปรเจกต์

```
src/
├── app/(main)/{module}/{screen}/page.tsx   # Server Component ต่อจอ
├── api/{module}/{screen}/
│   ├── _queries.ts                         # อ่าน DB (ไม่มี "use server")
│   ├── save_*.ts                           # mutate + revalidatePath
│   └── types.ts
├── components/{module}/                    # UI Components
├── lib/auth/                               # session, password, signed-token
├── data/menu.json                          # นิยามเมนู sidebar
└── data/favorites.json                     # รายการโปรด
prisma/schema.prisma                        # Database schema
script/sql/                                 # Migration scripts
```

---

## สำหรับนักพัฒนา

- อ่าน **[AGENTS.md](./AGENTS.md)** — กฎโปรเจกต์, directory conventions, ห้ามทำอะไร
- อ่าน **[docs/THEME.md](./docs/THEME.md)** — สี, ปุ่ม, panel
- อ่าน **[docs/UI-STANDARDS.md](./docs/UI-STANDARDS.md)** — โครงสร้างหน้า, field, ตาราง

**Next.js 16** มี breaking changes — อ่าน `node_modules/next/dist/docs/` ก่อนใช้ API ใหม่  
**Middleware** ถูก rename เป็น `proxy.ts` ใน Next.js 16 (`src/proxy.ts`)
