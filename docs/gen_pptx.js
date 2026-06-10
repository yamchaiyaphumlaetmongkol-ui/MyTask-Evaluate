/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const pptxgen = require("pptxgenjs");

const G1 = "1B5E20";   // dark green
const G2 = "2E7D32";   // medium green
const G3 = "388E3C";   // accent green
const G4 = "E8F5E9";   // light green bg
const WHITE = "FFFFFF";
const OFFWHITE = "F9FBF9";
const DARK = "212121";
const GRAY = "616161";
const LGRAY = "F5F5F5";

const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.12 });

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "นายเลิศมงคล ยามชัยภูมิ";
pres.title = "MyPerformanceV2 — ระบบประเมินผลงาน";

// ================================================
// SLIDE 1: COVER
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: G1 };

  // Large circle decoration top-right
  s.addShape(pres.shapes.OVAL, { x: 7.5, y: -1.2, w: 4.5, h: 4.5, fill: { color: G2, transparency: 60 }, line: { color: G2, transparency: 60 } });
  s.addShape(pres.shapes.OVAL, { x: 8.5, y: -0.5, w: 2.8, h: 2.8, fill: { color: G3, transparency: 50 }, line: { color: G3, transparency: 50 } });

  // Small dots bottom-left
  s.addShape(pres.shapes.OVAL, { x: 0.2, y: 4.5, w: 0.5, h: 0.5, fill: { color: G3, transparency: 40 }, line: { color: G3, transparency: 40 } });
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 4.9, w: 0.3, h: 0.3, fill: { color: G3, transparency: 50 }, line: { color: G3, transparency: 50 } });

  // Title
  s.addText("MyPerformanceV2", {
    x: 0.7, y: 1.2, w: 8.5, h: 1.2,
    fontSize: 52, fontFace: "Cambria", bold: true, color: WHITE, align: "left", margin: 0,
  });
  s.addText("ระบบประเมินผลงาน", {
    x: 0.7, y: 2.35, w: 8, h: 0.7,
    fontSize: 24, fontFace: "Arial", color: "A5D6A7", align: "left", margin: 0,
  });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 3.15, w: 4.5, h: 0.04, fill: { color: G3 }, line: { color: G3 },
  });

  // Author info
  s.addText([
    { text: "จัดทำโดย : ", options: { color: "A5D6A7", fontSize: 14 } },
    { text: "นายเลิศมงคล ยามชัยภูมิ", options: { color: WHITE, fontSize: 14, bold: true } },
  ], { x: 0.7, y: 3.4, w: 8, h: 0.4, fontFace: "Arial", margin: 0 });

  s.addText([
    { text: "ทีม : ", options: { color: "A5D6A7", fontSize: 14 } },
    { text: "ทีมพี่ภัค", options: { color: WHITE, fontSize: 14, bold: true } },
  ], { x: 0.7, y: 3.8, w: 8, h: 0.4, fontFace: "Arial", margin: 0 });

  s.addText("Next.js 16  ·  PostgreSQL  ·  Vercel", {
    x: 0.7, y: 4.5, w: 8, h: 0.4,
    fontSize: 13, fontFace: "Arial", color: "81C784", align: "left", margin: 0,
  });
}

// ================================================
// SLIDE 2: AGENDA
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  // Header band
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: G1 }, line: { color: G1 } });
  s.addText("สารบัญ", { x: 0.5, y: 0, w: 9, h: 1.1, fontSize: 30, fontFace: "Cambria", bold: true, color: WHITE, valign: "middle", margin: 0 });

  const items = [
    { n: "01", t: "ภาพรวมระบบ", d: "เป้าหมาย / โมดูล / ผู้ใช้งาน" },
    { n: "02", t: "การติดตั้ง", d: "Clone · Database · .env.local" },
    { n: "03", t: "การ Deploy", d: "Vercel + Environment Variables" },
    { n: "04", t: "การใช้งาน PM", d: "จัดการพนักงาน / Role / ตำแหน่ง" },
    { n: "05", t: "การใช้งาน PE", d: "แบบประเมิน / รอบประเมิน" },
    { n: "06", t: "การใช้งาน ESS", d: "ประเมินตนเอง / ติดตาม / ผู้จัดการ" },
  ];

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.8;
    const y = 1.4 + row * 1.35;

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.4, h: 1.1,
      fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow(), line: { color: "E0E0E0" },
    });
    // Number badge
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.2, w: 0.65, h: 0.65, fill: { color: G1 }, line: { color: G1 } });
    s.addText(item.n, { x: x + 0.15, y: y + 0.2, w: 0.65, h: 0.65, fontSize: 14, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    // Text
    s.addText(item.t, { x: x + 0.92, y: y + 0.1, w: 3.3, h: 0.45, fontSize: 15, fontFace: "Arial", bold: true, color: DARK, valign: "bottom", margin: 0 });
    s.addText(item.d, { x: x + 0.92, y: y + 0.55, w: 3.3, h: 0.4, fontSize: 12, fontFace: "Arial", color: GRAY, valign: "top", margin: 0 });
  });
}

// ================================================
// SLIDE 3: OVERVIEW
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: G1 }, line: { color: G1 } });
  s.addText("01  ·  ภาพรวมระบบ", { x: 0.5, y: 0, w: 9, h: 1.1, fontSize: 28, fontFace: "Cambria", bold: true, color: WHITE, valign: "middle", margin: 0 });

  // 3 module cards
  const modules = [
    { code: "PM", title: "จัดการพนักงาน", bullets: ["ข้อมูลพนักงาน", "บทบาท (Role)", "ตำแหน่งงาน", "รหัสผ่านผู้ใช้"] },
    { code: "PE", title: "จัดการแบบประเมิน", bullets: ["สร้าง Template", "กำหนดรอบประเมิน", "สัดส่วนคะแนน", "เกณฑ์เกรด"] },
    { code: "ESS", title: "บริการตนเองพนักงาน", bullets: ["ประเมินตนเอง", "ติดตามสถานะ", "ผู้จัดการให้คะแนน", "ดูผลการประเมิน"] },
  ];

  modules.forEach((m, i) => {
    const x = 0.4 + i * 3.12;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.3, w: 2.9, h: 3.9,
      fill: { color: WHITE }, rectRadius: 0.15, shadow: makeShadow(), line: { color: "E0E0E0" },
    });
    // Header
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.15, y: 1.45, w: 2.6, h: 0.75,
      fill: { color: G1 }, rectRadius: 0.1, line: { color: G1 },
    });
    s.addText(m.code, { x: x + 0.15, y: 1.45, w: 2.6, h: 0.75, fontSize: 22, fontFace: "Cambria", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(m.title, { x: x + 0.1, y: 2.3, w: 2.7, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: G2, align: "center", margin: 0 });

    m.bullets.forEach((b, j) => {
      s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: 2.92 + j * 0.49, w: 0.15, h: 0.15, fill: { color: G3 }, line: { color: G3 } });
      s.addText(b, { x: x + 0.48, y: 2.86 + j * 0.49, w: 2.2, h: 0.38, fontSize: 13, fontFace: "Arial", color: DARK, valign: "middle", margin: 0 });
    });
  });

  // User roles at bottom
  s.addText("ผู้ใช้งาน:  Admin — จัดการระบบทั้งหมด   |   User (พนักงาน) — ประเมินตนเองและดูผล", {
    x: 0.4, y: 5.25, w: 9.2, h: 0.35,
    fontSize: 12, fontFace: "Arial", color: GRAY, align: "center", margin: 0,
  });
}

// ================================================
// SLIDE 4: INSTALLATION
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: G2 }, line: { color: G2 } });
  s.addText("02  ·  การติดตั้งระบบ", { x: 0.5, y: 0, w: 9, h: 1.1, fontSize: 28, fontFace: "Cambria", bold: true, color: WHITE, valign: "middle", margin: 0 });

  const steps = [
    { n: "1", title: "Clone Repository", cmd: "git clone <repo-url>  &&  npm install" },
    { n: "2", title: "ตั้งค่า .env.local", cmd: "DATABASE_URL · SESSION_SECRET · CLICKUP_API_TOKEN · CLICKUP_TEAM_ID" },
    { n: "3", title: "ติดตั้งฐานข้อมูล", cmd: 'psql "$DATABASE_URL" -f script/sql/install_fresh.sql' },
    { n: "4", title: "รัน Dev Server", cmd: "npm run dev  →  http://localhost:3000" },
  ];

  steps.forEach((step, i) => {
    const y = 1.3 + i * 1.02;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y, w: 9, h: 0.88,
      fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow(), line: { color: "E0E0E0" },
    });
    // Step number
    s.addShape(pres.shapes.OVAL, { x: 0.7, y: y + 0.12, w: 0.62, h: 0.62, fill: { color: G1 }, line: { color: G1 } });
    s.addText(step.n, { x: 0.7, y: y + 0.12, w: 0.62, h: 0.62, fontSize: 16, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    // Title
    s.addText(step.title, { x: 1.46, y: y + 0.06, w: 2.8, h: 0.38, fontSize: 15, fontFace: "Arial", bold: true, color: DARK, valign: "middle", margin: 0 });
    // Command
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.35, y: y + 0.1, w: 5.0, h: 0.65, fill: { color: G4 }, rectRadius: 0.07, line: { color: "C8E6C9" } });
    s.addText(step.cmd, { x: 4.45, y: y + 0.1, w: 4.85, h: 0.65, fontSize: 12, fontFace: "Courier New", color: G1, valign: "middle", margin: 4 });
  });

  // Note
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 5.25, w: 9, h: 0.32,
    fill: { color: "FFF8E1" }, rectRadius: 0.06, line: { color: "FFE082" },
  });
  s.addText("💡  บัญชี admin จะถูกสร้างอัตโนมัติเมื่อ login ครั้งแรก  |  username: admin  |  password: Admin1234*", {
    x: 0.6, y: 5.25, w: 8.8, h: 0.32, fontSize: 12, fontFace: "Arial", color: "E65100", align: "center", valign: "middle", margin: 0,
  });
}

// ================================================
// SLIDE 5: DEPLOY
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: G3 }, line: { color: G3 } });
  s.addText("03  ·  การ Deploy บน Vercel", { x: 0.5, y: 0, w: 9, h: 1.1, fontSize: 28, fontFace: "Cambria", bold: true, color: WHITE, valign: "middle", margin: 0 });

  // Steps left column
  const dsteps = [
    "Push โค้ดขึ้น GitHub",
    "เปิด vercel.com → New Project → Import Repository",
    "Settings → Environment Variables → เพิ่ม 4 ค่า",
    "คลิก Deploy — ระบบจะรัน prisma generate && next build",
  ];

  dsteps.forEach((t, i) => {
    const y = 1.35 + i * 0.88;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.4, y, w: 5.6, h: 0.72,
      fill: { color: WHITE }, rectRadius: 0.1, shadow: makeShadow(), line: { color: "E0E0E0" },
    });
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.14, w: 0.45, h: 0.45, fill: { color: G3 }, line: { color: G3 } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.14, w: 0.45, h: 0.45, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(t, { x: 1.17, y, w: 4.7, h: 0.72, fontSize: 14, fontFace: "Arial", color: DARK, valign: "middle", margin: 0 });
  });

  // Env table right
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.2, y: 1.3, w: 3.4, h: 3.95,
    fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow(), line: { color: "E0E0E0" },
  });
  s.addText("Environment Variables", { x: 6.35, y: 1.38, w: 3.1, h: 0.42, fontSize: 13, fontFace: "Arial", bold: true, color: G2, align: "center", margin: 0 });

  const envs = ["DATABASE_URL", "SESSION_SECRET", "CLICKUP_API_TOKEN", "CLICKUP_TEAM_ID"];
  envs.forEach((e, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.38, y: 1.88 + i * 0.72, w: 3.05, h: 0.58,
      fill: { color: G4 }, rectRadius: 0.07, line: { color: "C8E6C9" },
    });
    s.addText(e, { x: 6.48, y: 1.88 + i * 0.72, w: 2.85, h: 0.58, fontSize: 11, fontFace: "Courier New", color: G1, valign: "middle", margin: 3 });
  });
}

// ================================================
// SLIDE 6: PM MODULE
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: G1 }, line: { color: G1 } });
  s.addText("04  ·  โมดูล PM — จัดการพนักงาน", { x: 0.5, y: 0, w: 9, h: 1.1, fontSize: 28, fontFace: "Cambria", bold: true, color: WHITE, valign: "middle", margin: 0 });

  const menus = [
    { title: "เพิ่มข้อมูลพนักงาน", path: "/pm/pmms01", desc: "เพิ่ม / แก้ไข / ลบข้อมูลพนักงาน\nSync ข้อมูลจาก ClickUp อัตโนมัติ" },
    { title: "บทบาทพนักงาน", path: "/pm/pmms02", desc: "จัดการ Role ระดับ R01-R04\nกำหนดลำดับสายบังคับบัญชา" },
    { title: "ตำแหน่งงาน", path: "/pm/pmms03", desc: "จัดการตำแหน่ง P01-P04\nคำอธิบายและสถานะ" },
    { title: "จัดการรหัสผ่าน", path: "/admin/user-passwords", desc: "Admin Reset รหัสผ่านพนักงาน\nรหัสเริ่มต้น: P@ssword" },
  ];

  menus.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.85;
    const y = 1.3 + row * 1.95;

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.5, h: 1.75,
      fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow(), line: { color: "E0E0E0" },
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.15, y: y + 0.15, w: 4.2, h: 0.5,
      fill: { color: G4 }, rectRadius: 0.08, line: { color: "C8E6C9" },
    });
    s.addText(m.title, { x: x + 0.25, y: y + 0.15, w: 3.5, h: 0.5, fontSize: 15, fontFace: "Arial", bold: true, color: G1, valign: "middle", margin: 0 });
    s.addText(m.path, { x: x + 2.7, y: y + 0.15, w: 1.5, h: 0.5, fontSize: 10, fontFace: "Courier New", color: G3, align: "right", valign: "middle", margin: 3 });
    s.addText(m.desc, { x: x + 0.2, y: y + 0.75, w: 4.1, h: 0.85, fontSize: 13, fontFace: "Arial", color: DARK, valign: "top", margin: 0 });
  });
}

// ================================================
// SLIDE 7: PE MODULE
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: G2 }, line: { color: G2 } });
  s.addText("05  ·  โมดูล PE — แบบประเมิน", { x: 0.5, y: 0, w: 9, h: 1.1, fontSize: 28, fontFace: "Cambria", bold: true, color: WHITE, valign: "middle", margin: 0 });

  // Left: flow diagram
  const flow = [
    { label: "Template Master", sub: "สร้างโครงสร้างคำถาม" },
    { label: "Master Head", sub: "หัวข้อ + สัดส่วน (%)" },
    { label: "Master Sub", sub: "หัวข้อย่อย + เกณฑ์เกรด" },
    { label: "Round (รอบประเมิน)", sub: "ปี / ครึ่งปี / วันที่" },
  ];

  flow.forEach((f, i) => {
    const y = 1.3 + i * 0.98;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.4, y, w: 4.5, h: 0.72,
      fill: { color: i === 3 ? G1 : WHITE }, rectRadius: 0.1,
      shadow: makeShadow(), line: { color: i === 3 ? G1 : "E0E0E0" },
    });
    s.addText(f.label, { x: 0.55, y: y + 0.04, w: 4.2, h: 0.38, fontSize: 15, fontFace: "Arial", bold: true, color: i === 3 ? WHITE : G2, valign: "bottom", margin: 0 });
    s.addText(f.sub, { x: 0.55, y: y + 0.38, w: 4.2, h: 0.3, fontSize: 12, fontFace: "Arial", color: i === 3 ? "A5D6A7" : GRAY, valign: "top", margin: 0 });
    if (i < 3) {
      s.addShape(pres.shapes.RECTANGLE, { x: 2.6, y: y + 0.72, w: 0.04, h: 0.26, fill: { color: G3 }, line: { color: G3 } });
    }
  });

  // Right: scoring info
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.4, y: 1.3, w: 4.2, h: 3.85,
    fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow(), line: { color: "E0E0E0" },
  });
  s.addText("คุณสมบัติการประเมิน", { x: 5.6, y: 1.4, w: 3.8, h: 0.45, fontSize: 15, fontFace: "Arial", bold: true, color: G1, align: "center", margin: 0 });

  const features = [
    "กำหนดสัดส่วนคะแนนแต่ละหัวข้อ (%)",
    "คะแนนต่ำสุด – สูงสุด ต่อหัวข้อย่อย",
    "เกณฑ์เกรด A / B / C / D / E",
    "Self Assessment + Manager Assessment",
    "ผลลัพธ์รวมคะแนนอัตโนมัติ",
  ];
  features.forEach((f, i) => {
    s.addShape(pres.shapes.OVAL, { x: 5.65, y: 2.0 + i * 0.55, w: 0.18, h: 0.18, fill: { color: G3 }, line: { color: G3 } });
    s.addText(f, { x: 5.95, y: 1.94 + i * 0.55, w: 3.5, h: 0.42, fontSize: 13, fontFace: "Arial", color: DARK, valign: "middle", margin: 0 });
  });

  s.addText("เมนู: /pe/pems01", { x: 5.6, y: 4.85, w: 3.8, h: 0.25, fontSize: 11, fontFace: "Courier New", color: G2, align: "center", margin: 0 });
}

// ================================================
// SLIDE 8: ESS MODULE
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: G3 }, line: { color: G3 } });
  s.addText("06  ·  โมดูล ESS — บริการตนเองพนักงาน", { x: 0.5, y: 0, w: 9, h: 1.1, fontSize: 26, fontFace: "Cambria", bold: true, color: WHITE, valign: "middle", margin: 0 });

  const essMenus = [
    { path: "/ess/esspets01", title: "ค้นหาแบบประเมินตนเอง", role: "พนักงานทุกคน", desc: "กรอก Self Assessment\nแสดงสถานะ / ส่งแบบประเมิน" },
    { path: "/ess/esspets03", title: "ติดตามสถานะการประเมิน", role: "พนักงานทุกคน", desc: "ดูสถานะการส่งแบบประเมิน\nประวัติรอบที่ผ่านมา" },
    { path: "/ess/esspets04", title: "ค้นหาแบบประเมินพนักงาน", role: "ผู้จัดการ", desc: "Manager Assessment\nให้คะแนนพนักงานในสังกัด" },
  ];

  essMenus.forEach((m, i) => {
    const x = 0.35 + i * 3.18;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.3, w: 2.95, h: 3.9,
      fill: { color: WHITE }, rectRadius: 0.12, shadow: makeShadow(), line: { color: "E0E0E0" },
    });
    // Path tag
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.12, y: 1.42, w: 2.72, h: 0.42,
      fill: { color: G4 }, rectRadius: 0.08, line: { color: "C8E6C9" },
    });
    s.addText(m.path, { x: x + 0.15, y: 1.42, w: 2.68, h: 0.42, fontSize: 10, fontFace: "Courier New", color: G1, align: "center", valign: "middle", margin: 0 });

    s.addText(m.title, { x: x + 0.12, y: 1.95, w: 2.72, h: 0.7, fontSize: 14, fontFace: "Arial", bold: true, color: DARK, align: "center", valign: "middle", margin: 0 });

    // Role badge
    const badgeColor = m.role === "ผู้จัดการ" ? G1 : G3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.5, y: 2.72, w: 1.95, h: 0.32,
      fill: { color: badgeColor }, rectRadius: 0.1, line: { color: badgeColor },
    });
    s.addText(m.role, { x: x + 0.5, y: 2.72, w: 1.95, h: 0.32, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });

    s.addText(m.desc, { x: x + 0.15, y: 3.15, w: 2.65, h: 0.9, fontSize: 13, fontFace: "Arial", color: GRAY, align: "center", valign: "top", margin: 0 });
  });

  // First-login note
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.35, y: 5.22, w: 9.3, h: 0.36,
    fill: { color: "FFF3E0" }, rectRadius: 0.06, line: { color: "FFCC02" },
  });
  s.addText("Login ครั้งแรก: username = ClickUp Email  |  password = P@ssword  →  ระบบบังคับเปลี่ยนรหัสผ่าน", {
    x: 0.45, y: 5.22, w: 9.15, h: 0.36, fontSize: 12, fontFace: "Arial", color: "E65100", align: "center", valign: "middle", margin: 0,
  });
}

// ================================================
// SLIDE 9: CLOSING
// ================================================
{
  const s = pres.addSlide();
  s.background = { color: G1 };

  s.addShape(pres.shapes.OVAL, { x: -1, y: -1, w: 5, h: 5, fill: { color: G2, transparency: 70 }, line: { color: G2, transparency: 70 } });
  s.addShape(pres.shapes.OVAL, { x: 7, y: 3, w: 4, h: 4, fill: { color: G3, transparency: 60 }, line: { color: G3, transparency: 60 } });

  s.addText("ขอบคุณ", { x: 1, y: 1.2, w: 8, h: 1.4, fontSize: 54, fontFace: "Cambria", bold: true, color: WHITE, align: "center", margin: 0 });
  s.addText("Thank You", { x: 1, y: 2.6, w: 8, h: 0.6, fontSize: 24, fontFace: "Cambria", color: "A5D6A7", align: "center", margin: 0, italic: true });

  s.addShape(pres.shapes.RECTANGLE, { x: 3, y: 3.4, w: 4, h: 0.04, fill: { color: G3 }, line: { color: G3 } });

  s.addText([
    { text: "MyPerformanceV2 — ระบบประเมินผลงาน", options: { breakLine: true } },
    { text: "จัดทำโดย นายเลิศมงคล ยามชัยภูมิ  ·  ทีมพี่ภัค" },
  ], {
    x: 1, y: 3.6, w: 8, h: 0.9, fontSize: 16, fontFace: "Arial", color: "C8E6C9", align: "center", valign: "middle", margin: 0,
  });

  s.addText("Next.js 16  ·  PostgreSQL (Neon)  ·  Prisma  ·  Vercel", {
    x: 1, y: 4.7, w: 8, h: 0.4, fontSize: 13, fontFace: "Arial", color: "81C784", align: "center", margin: 0,
  });
}

// ================================================
// SAVE
// ================================================
const outPath = "C:\\Users\\park0\\OneDrive\\Desktop\\SiteProject\\skibidi_evaluate_project\\docs\\นำเสนอระบบ_MyPerformanceV2.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Created:", outPath);
});
