/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
} = require("docx");
const fs = require("fs");
const path = require("path");

const GREEN  = "1B5E20";
const LGREEN = "E8F5E9";
const MGREEN = "388E3C";
const GRAY   = "757575";
const LGRAY  = "F5F5F5";
const BLACK  = "212121";
const WHITE  = "FFFFFF";
const ACCENT = "2E7D32";

const border = (color = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 1, color });
const cellBorders = (color = "CCCCCC") => ({
  top: border(color), bottom: border(color), left: border(color), right: border(color),
});
const noBorders = () => ({
  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
});

function h(level, text, opts = {}) {
  const sizes = { 1: 40, 2: 32, 3: 26 };
  const colors = { 1: GREEN, 2: MGREEN, 3: BLACK };
  return new Paragraph({
    heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][level - 1],
    spacing: { before: level === 1 ? 400 : 240, after: 160 },
    ...opts,
    children: [new TextRun({ text, bold: true, size: sizes[level], color: colors[level], font: "TH SarabunPSK" })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    ...opts,
    children: [new TextRun({ text, size: 24, font: "TH SarabunPSK", color: BLACK })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 24, font: "TH SarabunPSK", color: BLACK })],
  });
}

function step(num, text, detail = "") {
  return new Paragraph({
    numbering: { reference: "steps", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text, size: 24, font: "TH SarabunPSK", bold: true, color: ACCENT }),
      ...(detail ? [new TextRun({ text: `  ${detail}`, size: 24, font: "TH SarabunPSK", color: BLACK })] : []),
    ],
  });
}

function infoBox(title, lines, color = LGREEN, borderColor = MGREEN) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: border(borderColor), bottom: border(borderColor), left: { style: BorderStyle.SINGLE, size: 8, color: borderColor }, right: border(borderColor) },
      width: { size: 9026, type: WidthType.DXA },
      shading: { fill: color, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [
        ...(title ? [new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: title, bold: true, size: 24, font: "TH SarabunPSK", color: ACCENT })] })] : []),
        ...lines.map(l => new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: l, size: 24, font: "TH SarabunPSK", color: BLACK })] })),
      ],
    })]})],
  });
}

function menuTable(rows) {
  const hdr = (t) => new TableCell({
    borders: cellBorders(GREEN),
    width: { size: rows[0][2] || 3000, type: WidthType.DXA },
    shading: { fill: GREEN, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 22, font: "TH SarabunPSK", color: WHITE })] })],
  });
  const cell = (t, w) => new TableCell({
    borders: cellBorders(),
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: t, size: 22, font: "TH SarabunPSK" })] })],
  });
  const widths = rows[0];
  const dataRows = rows.slice(1);
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: ["เมนู / หน้าจอ", "Path URL", "คำอธิบาย"].map((t, i) => hdr(t)) }),
      ...dataRows.map(r => new TableRow({ children: r.map((t, i) => cell(t, widths[i])) })),
    ],
  });
}

function envTable(rows) {
  const widths = [3000, 6026];
  const hCell = (t, w) => new TableCell({
    borders: cellBorders(GREEN),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: GREEN, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 22, font: "TH SarabunPSK", color: WHITE })] })],
  });
  const dCell = (t, w, mono = false) => new TableCell({
    borders: cellBorders(),
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: t, size: 22, font: mono ? "Courier New" : "TH SarabunPSK", color: mono ? ACCENT : BLACK })] })],
  });
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: ["Environment Variable", "คำอธิบาย"].map((t, i) => hCell(t, widths[i])) }),
      ...rows.map(([k, v]) => new TableRow({ children: [dCell(k, widths[0], true), dCell(v, widths[1])] })),
    ],
  });
}

function space(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun("")] }));
}

// ==================== DOCUMENT ====================
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 300 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "-",     alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 300 } } } },
        ],
      },
      {
        reference: "steps",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "TH SarabunPSK", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 40, bold: true, font: "TH SarabunPSK", color: GREEN },
        paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "TH SarabunPSK", color: MGREEN },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "TH SarabunPSK", color: BLACK },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  sections: [
    // ==================== COVER PAGE ====================
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 1800, after: 0 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "MyPerformanceV2", bold: true, size: 72, font: "TH SarabunPSK", color: GREEN })] }),
        new Paragraph({ spacing: { before: 200, after: 0 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "ระบบประเมินผลงาน", size: 48, font: "TH SarabunPSK", color: GRAY })] }),
        new Paragraph({ spacing: { before: 600, after: 0 }, alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN } },
          children: [new TextRun("")] }),
        ...space(2),
        new Paragraph({ spacing: { before: 400, after: 80 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "คู่มือการติดตั้งและการใช้งาน", bold: true, size: 40, font: "TH SarabunPSK", color: BLACK })] }),
        new Paragraph({ spacing: { before: 80, after: 0 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Installation & User Manual", size: 28, font: "TH SarabunPSK", color: GRAY, italics: true })] }),
        ...space(3),
        new Table({
          width: { size: 5000, type: WidthType.DXA },
          columnWidths: [2200, 2800],
          rows: [
            ...[
              ["จัดทำโดย", "นายเลิศมงคล ยามชัยภูมิ"],
              ["ทีม", "ทีมพี่ภัค"],
              ["เทคโนโลยี", "Next.js 16 · PostgreSQL · Vercel"],
              ["เวอร์ชัน", "2.0"],
            ].map(([k, v]) => new TableRow({ children: [
              new TableCell({ borders: noBorders(), width: { size: 2200, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 0, right: 120 }, verticalAlign: VerticalAlign.TOP,
                children: [new Paragraph({ children: [new TextRun({ text: k, size: 24, font: "TH SarabunPSK", color: GRAY })] })] }),
              new TableCell({ borders: noBorders(), width: { size: 2800, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 0, right: 0 },
                children: [new Paragraph({ children: [new TextRun({ text: v, size: 24, bold: true, font: "TH SarabunPSK", color: BLACK })] })] }),
            ]})),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ==================== CONTENT ====================
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: {
        default: new Header({ children: [
          new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREEN } }, alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "คู่มือระบบ MyPerformanceV2", size: 20, font: "TH SarabunPSK", color: GRAY })] }),
        ] }),
      },
      footers: {
        default: new Footer({ children: [
          new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: MGREEN } }, alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "หน้า ", size: 20, font: "TH SarabunPSK", color: GRAY }), new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "TH SarabunPSK", color: GRAY })] }),
        ] }),
      },
      children: [

        // ===== CHAPTER 1: OVERVIEW =====
        h(1, "1. ภาพรวมระบบ"),
        p("MyPerformanceV2 คือระบบประเมินผลงานพนักงานที่พัฒนาด้วย Next.js 16 App Router ร่วมกับฐานข้อมูล PostgreSQL (Neon) และ deploy บน Vercel ระบบรองรับการทำงาน 3 โมดูลหลัก:"),
        ...space(1),
        infoBox("โมดูลหลักของระบบ", [
          "PM — จัดการข้อมูลพนักงาน  ·  ตำแหน่ง  ·  บทบาท",
          "PE — จัดการแบบประเมินและรอบประเมินผลการปฏิบัติงาน",
          "ESS — บริการตนเองพนักงาน : ค้นหา / กรอก / ติดตามผลการประเมิน",
        ]),
        ...space(1),
        h(2, "1.1 โครงสร้างผู้ใช้งาน"),
        p("ระบบแบ่งผู้ใช้งานออกเป็น 2 ระดับ:"),
        bullet("Admin — จัดการข้อมูลพนักงาน แบบประเมิน และรหัสผ่านผู้ใช้ทั้งหมด"),
        bullet("User (พนักงาน) — กรอกแบบประเมินตนเอง ติดตามสถานะ และดูผลการประเมิน"),
        ...space(1),
        h(2, "1.2 เทคโนโลยีที่ใช้"),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3000, 6026],
          rows: [
            new TableRow({ tableHeader: true, children: ["ส่วน", "เทคโนโลยี"].map((t, i) => new TableCell({
              borders: cellBorders(GREEN), width: { size: [3000,6026][i], type: WidthType.DXA }, shading: { fill: GREEN, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 },
              children: [new Paragraph({ children: [new TextRun({ text: t, bold:true, size:22, font:"TH SarabunPSK", color:WHITE })] })],
            })) }),
            ...[ ["Frontend", "Next.js 16 App Router, Bootstrap 5, Bootstrap Icons"], ["Backend", "Next.js Route Handlers, Prisma ORM"], ["ฐานข้อมูล", "PostgreSQL (Neon Serverless)"], ["Auth", "Custom signed session cookie (HMAC-SHA256)"], ["Deploy", "Vercel (Serverless)"], ["ClickUp Integration", "ClickUp REST API v2 — sync ข้อมูลพนักงาน"] ]
              .map(([k,v]) => new TableRow({ children: [k,v].map((t, i) => new TableCell({
                borders: cellBorders(), width: { size: [3000,6026][i], type: WidthType.DXA }, margins: { top:80,bottom:80,left:120,right:120 },
                children: [new Paragraph({ children: [new TextRun({ text: t, size:22, font:"TH SarabunPSK" })] })],
              })) })),
          ],
        }),

        ...space(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== CHAPTER 2: INSTALL =====
        h(1, "2. การติดตั้งระบบ"),
        h(2, "2.1 ความต้องการของระบบ"),
        bullet("Node.js 18.x หรือใหม่กว่า"),
        bullet("npm 9.x หรือใหม่กว่า"),
        bullet("PostgreSQL 14+ (แนะนำ Neon Serverless)"),
        bullet("บัญชี Vercel (สำหรับ deploy)"),
        bullet("บัญชี ClickUp + API Token (สำหรับ sync พนักงาน)"),

        ...space(1),
        h(2, "2.2 Clone และติดตั้ง Dependencies"),
        p("เปิด Terminal แล้วรันคำสั่งต่อไปนี้:"),
        ...space(1),
        infoBox("คำสั่ง", [
          "git clone https://github.com/<your-org>/MyTask-Evaluate.git",
          "cd MyTask-Evaluate",
          "npm install",
        ], "F1F8E9", MGREEN),

        ...space(1),
        h(2, "2.3 ตั้งค่า Environment Variables"),
        p("สร้างไฟล์ .env.local ที่ root ของโปรเจกต์ แล้วใส่ค่าต่อไปนี้:"),
        ...space(1),
        infoBox(".env.local", [
          "DATABASE_URL='postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require'",
          "SESSION_SECRET='your-random-secret-here'",
          "CLICKUP_API_TOKEN='pk_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx'",
          "CLICKUP_TEAM_ID='9xxxxxxxxx'",
        ], "F3E5F5", "7B1FA2"),
        ...space(1),
        envTable([
          ["DATABASE_URL", "Connection string ของ PostgreSQL (Neon pooled URL)"],
          ["SESSION_SECRET", "Random string สำหรับ sign session cookie — สร้างด้วย: openssl rand -base64 32"],
          ["CLICKUP_API_TOKEN", "API Token จาก ClickUp Settings → Apps (ขึ้นต้นด้วย pk_)"],
          ["CLICKUP_TEAM_ID", "Team ID จาก URL ของ ClickUp Workspace"],
        ]),

        ...space(1),
        h(2, "2.4 วิธีหา ClickUp API Token"),
        step(1, "เปิด ClickUp", "→ คลิกรูปโปรไฟล์มุมซ้ายล่าง"),
        step(2, "เลือก Settings"),
        step(3, "เลือก Apps", "ในเมนูด้านซ้าย"),
        step(4, "คลิก Generate", "ใต้หัวข้อ API Token"),
        step(5, "Copy token", "ที่ขึ้นต้นด้วย pk_"),
        ...space(1),
        h(2, "2.5 ติดตั้งฐานข้อมูล"),
        p("รันไฟล์ SQL ครั้งเดียวเพื่อสร้างตารางทั้งหมด:"),
        ...space(1),
        infoBox("Fresh Install", [
          'psql "$DATABASE_URL" -f script/sql/install_fresh.sql',
        ], "F1F8E9", MGREEN),
        ...space(1),
        p("ไฟล์นี้จะสร้างตาราง pm_role, pm_position, pm_employee, app_user_auth, app_session, pe_evaluation_* และ seed ข้อมูล role/position ตัวอย่าง"),

        ...space(1),
        h(2, "2.6 รัน Development Server"),
        ...space(1),
        infoBox("คำสั่ง", [
          "npm run dev    # เริ่ม dev server ที่ http://localhost:3000",
          "npm run build  # ตรวจสอบ TypeScript + build สำหรับ production",
        ], "F1F8E9", MGREEN),

        ...space(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== CHAPTER 3: DEPLOY =====
        h(1, "3. การ Deploy บน Vercel"),
        step(1, "Push โค้ดขึ้น GitHub"),
        step(2, "เปิด vercel.com", "→ New Project → Import Repository"),
        step(3, "ตั้ง Environment Variables", "ใน Vercel Dashboard → Settings → Environment Variables"),
        step(4, "เพิ่มค่า", "DATABASE_URL, SESSION_SECRET, CLICKUP_API_TOKEN, CLICKUP_TEAM_ID"),
        step(5, "คลิก Deploy", "Vercel จะรัน prisma generate && next build อัตโนมัติ"),
        ...space(1),
        infoBox("หมายเหตุ", [
          "บัญชี admin จะถูกสร้างอัตโนมัติเมื่อ login ครั้งแรก",
          "username: admin  |  password: Admin1234*",
        ], "FFF8E1", "F57F17"),

        ...space(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== CHAPTER 4: LOGIN =====
        h(1, "4. การเข้าสู่ระบบ"),
        h(2, "4.1 บัญชี Admin"),
        p("ใช้สำหรับจัดการระบบทั้งหมด ไม่ผูกกับข้อมูลพนักงาน:"),
        ...space(1),
        new Table({
          width: { size: 5000, type: WidthType.DXA },
          columnWidths: [2000, 3000],
          rows: [
            ...[ ["ชื่อผู้ใช้", "admin"], ["รหัสผ่าน", "Admin1234*"] ]
              .map(([k,v]) => new TableRow({ children: [
                new TableCell({ borders: cellBorders(GREEN), width:{size:2000,type:WidthType.DXA}, shading:{fill:LGREEN,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:k,bold:true,size:24,font:"TH SarabunPSK",color:ACCENT})]})] }),
                new TableCell({ borders: cellBorders(GREEN), width:{size:3000,type:WidthType.DXA}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:v,size:24,font:"Courier New",color:BLACK})]})] }),
              ]})),
          ],
        }),

        ...space(1),
        h(2, "4.2 บัญชีพนักงาน"),
        bullet("ชื่อผู้ใช้: อีเมล ClickUp ของพนักงาน"),
        bullet("รหัสผ่านเริ่มต้น: P@ssword"),
        bullet("ระบบจะบังคับเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก"),
        ...space(1),
        h(2, "4.3 การ Logout"),
        p("คลิกปุ่ม \"ออกจากระบบ\" ที่มุมขวาบนของหน้าจอ"),

        ...space(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== CHAPTER 5: USER GUIDE =====
        h(1, "5. คู่มือการใช้งาน"),
        h(2, "5.1 หน้าจอหลัก (Dashboard)"),
        p("หลังจาก login สำเร็จ ระบบจะแสดงหน้า Dashboard ที่มี:"),
        bullet("แถบ Sidebar ด้านซ้าย — เมนูหลักทั้งหมด"),
        bullet("Header — ชื่อระบบ, ปุ่มออกจากระบบ"),
        bullet("Content Area — เนื้อหาของหน้าที่เลือก"),
        ...space(1),
        h(2, "5.2 โมดูล PM — จัดการข้อมูลพนักงาน"),
        p("ผู้ใช้ที่มีสิทธิ์ Admin สามารถจัดการได้ดังนี้:"),
        ...space(1),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2800, 2000, 4226],
          rows: [
            new TableRow({ tableHeader: true, children: ["เมนู","Path","คำอธิบาย"].map((t,i) => new TableCell({
              borders:cellBorders(GREEN), width:{size:[2800,2000,4226][i],type:WidthType.DXA}, shading:{fill:GREEN,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,bold:true,size:22,font:"TH SarabunPSK",color:WHITE})]})]
            })) }),
            ...[
              ["เพิ่มข้อมูลพนักงาน",   "/pm/pmms01", "เพิ่ม/แก้ไข/ลบข้อมูลพนักงาน sync จาก ClickUp"],
              ["เพิ่มบทบาทพนักงาน",   "/pm/pmms02", "จัดการบทบาท (R01-R04) ระดับและคำอธิบาย"],
              ["เพิ่มตำแหน่งงาน",      "/pm/pmms03", "จัดการตำแหน่งงาน (P01-P04) ของบริษัท"],
              ["จัดการรหัสผ่านผู้ใช้", "/admin/user-passwords", "Reset รหัสผ่านพนักงานโดย Admin"],
            ].map(r => new TableRow({ children: r.map((t,i) => new TableCell({
              borders:cellBorders(), width:{size:[2800,2000,4226][i],type:WidthType.DXA}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,size:22,font:"TH SarabunPSK"})]})]
            })) })),
          ],
        }),

        ...space(1),
        h(2, "5.3 โมดูล PE — จัดการแบบประเมิน"),
        p("ใช้สำหรับสร้างและจัดการแบบประเมินผลงาน มีโครงสร้าง 2 ชั้น:"),
        bullet("แม่แบบ (Template Master) — กำหนดโครงสร้างคำถามและสัดส่วนคะแนน"),
        bullet("รอบประเมิน (Round) — เปิดรอบประเมินจากแม่แบบ กำหนดปี/ครึ่งปี/วันที่"),
        ...space(1),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2800, 2000, 4226],
          rows: [
            new TableRow({ tableHeader: true, children: ["เมนู","Path","คำอธิบาย"].map((t,i) => new TableCell({
              borders:cellBorders(GREEN), width:{size:[2800,2000,4226][i],type:WidthType.DXA}, shading:{fill:GREEN,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,bold:true,size:22,font:"TH SarabunPSK",color:WHITE})]})]
            })) }),
            ...[
              ["สร้าง/แก้ไข แบบประเมิน", "/pe/pems01", "สร้างแม่แบบ, กำหนดหัวข้อ/หัวข้อย่อย, สัดส่วนคะแนน, เกณฑ์เกรด"],
            ].map(r => new TableRow({ children: r.map((t,i) => new TableCell({
              borders:cellBorders(), width:{size:[2800,2000,4226][i],type:WidthType.DXA}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,size:22,font:"TH SarabunPSK"})]})]
            })) })),
          ],
        }),

        ...space(1),
        h(2, "5.4 โมดูล ESS — บริการตนเองพนักงาน"),
        p("พนักงานทุกคนสามารถใช้งานได้ดังนี้:"),
        ...space(1),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2800, 2000, 4226],
          rows: [
            new TableRow({ tableHeader: true, children: ["เมนู","Path","คำอธิบาย"].map((t,i) => new TableCell({
              borders:cellBorders(GREEN), width:{size:[2800,2000,4226][i],type:WidthType.DXA}, shading:{fill:GREEN,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,bold:true,size:22,font:"TH SarabunPSK",color:WHITE})]})]
            })) }),
            ...[
              ["ค้นหาแบบประเมินตนเอง",  "/ess/esspets01", "ค้นหาและกรอกแบบประเมินของตนเอง (Self Assessment)"],
              ["ติดตามสถานะการประเมิน", "/ess/esspets03", "ดูสถานะการส่งแบบประเมินของตนเอง"],
              ["ค้นหาแบบประเมินพนักงาน","/ess/esspets04", "สำหรับผู้จัดการ: ดู/ประเมินลูกน้อง (Manager Assessment)"],
            ].map(r => new TableRow({ children: r.map((t,i) => new TableCell({
              borders:cellBorders(), width:{size:[2800,2000,4226][i],type:WidthType.DXA}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,size:22,font:"TH SarabunPSK"})]})]
            })) })),
          ],
        }),

        ...space(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== CHAPTER 6: CLICKUP SYNC =====
        h(1, "6. การ Sync ข้อมูลพนักงานจาก ClickUp"),
        p("ระบบรองรับการดึงข้อมูลพนักงานจาก ClickUp โดยอัตโนมัติ:"),
        bullet("ชื่อ-นามสกุล, อีเมล, รูปโปรไฟล์ จะถูก sync จาก ClickUp"),
        bullet("อีเมล ClickUp จะถูกใช้เป็น username ในการ login"),
        bullet("บัญชีผู้ใช้จะถูกสร้างอัตโนมัติเมื่อ Admin เพิ่มพนักงานในระบบ"),
        ...space(1),
        infoBox("ขั้นตอน", [
          "1. Admin เพิ่มข้อมูลพนักงานใน PM → เพิ่มข้อมูลพนักงาน",
          "2. กรอก ClickUp User ID และ ClickUp Email",
          "3. ระบบสร้างบัญชีผู้ใช้อัตโนมัติ (username = clickup email)",
          "4. พนักงาน login ด้วย ClickUp email + รหัสผ่านเริ่มต้น P@ssword",
        ], LGREEN, MGREEN),

        ...space(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== CHAPTER 7: TROUBLESHOOT =====
        h(1, "7. การแก้ปัญหาที่พบบ่อย"),
        ...space(1),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3500, 5526],
          rows: [
            new TableRow({ tableHeader: true, children: ["ปัญหา","วิธีแก้"].map((t,i) => new TableCell({
              borders:cellBorders(GREEN), width:{size:[3500,5526][i],type:WidthType.DXA}, shading:{fill:GREEN,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,bold:true,size:22,font:"TH SarabunPSK",color:WHITE})]})]
            })) }),
            ...[
              ["Login แล้วถูก redirect กลับหน้า login", "ตรวจสอบว่า SESSION_SECRET และ DATABASE_URL ตั้งค่าถูกต้องใน Vercel Environment Variables"],
              ["หน้าเปล่า / ข้อผิดพลาด Database", "ตรวจสอบ DATABASE_URL และรัน install_fresh.sql กับ database ที่ใช้จริง"],
              ["login ด้วย admin ไม่ได้", "ตรวจสอบรหัสผ่าน Admin1234* (A ใหญ่, มี * ท้าย)"],
              ["พนักงาน login ไม่ได้", "Admin ต้อง sync ข้อมูลพนักงานก่อน และใช้ email ClickUp เป็น username"],
              ["Build error บน Vercel", "ตรวจสอบ Environment Variables ครบทุกตัว โดยเฉพาะ DATABASE_URL"],
            ].map(r => new TableRow({ children: r.map((t,i) => new TableCell({
              borders:cellBorders(), width:{size:[3500,5526][i],type:WidthType.DXA}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,size:22,font:"TH SarabunPSK"})]})]
            })) })),
          ],
        }),

        ...space(3),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREEN } }, spacing: { before: 400, after: 80 },
          children: [new TextRun({ text: "จัดทำโดย  นายเลิศมงคล ยามชัยภูมิ  ·  ทีมพี่ภัค", size: 22, font: "TH SarabunPSK", color: GRAY, italics: true })] }),
      ],
    },
  ],
});

const outPath = path.join(__dirname, "คู่มือระบบ_MyPerformanceV2.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Created:", outPath);
});
