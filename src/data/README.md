# ตารางเมนู (`menu.json` → `rows[]`)

จำลองตาราง DB แบบ flat แล้ว build เป็น tree ใน `get_menu.ts`

## คอลัมน์ (MenuRow)

| ฟิลด์ | ความหมาย |
|--------|----------|
| `id` | PK |
| `parentId` | FK → `id` ของ folder แม่ (`null` = ระดับบนสุด) |
| `type` | `"folder"` = กดหุบ/กางลูกเท่านั้น (ไม่เปิด route), `"page"` = หน้าจอ |
| `path` | **page:** route บังคับ · **folder:** ใส่ `null` (ไม่ใช้ลิงก์) |
| `label` | ชื่อแสดง |
| `icon` | Bootstrap Icons class |
| `code` | รหัสโมดูล (optional) |
| `sortOrder` | เรียงลำดับในระดับเดียวกัน |
| `isEnabled` | `false` = ซ่อน (default แสดง) |

## เพิ่มหน้าจอ (page ข้างใน folder)

```json
{
  "id": "pmms04",
  "parentId": "pm",
  "type": "page",
  "path": "/pm/pmms04",
  "label": "PMMS04 — ชื่อหน้า",
  "sortOrder": 4
}
```

จากนั้นสร้าง `src/app/(main)/pm/pmms04/page.tsx`

## เพิ่ม folder ระดับบน

```json
{
  "id": "inventory",
  "parentId": null,
  "type": "folder",
  "path": "/inventory",
  "label": "คลังสินค้า",
  "icon": "bi-box-seam",
  "code": "INV",
  "sortOrder": 35
}
```

## folder ซ้อน folder (หลายชั้น)

```json
{
  "id": "hr-settings",
  "parentId": "pm",
  "type": "folder",
  "path": null,
  "label": "ตั้งค่า HR",
  "icon": "bi-sliders",
  "sortOrder": 0
},
{
  "id": "hr-role-matrix",
  "parentId": "hr-settings",
  "type": "page",
  "path": "/pm/settings/roles",
  "label": "เมทริกซ์บทบาท",
  "sortOrder": 1
}
```

## จาก DB (อนาคต)

```sql
SELECT id, parent_id, type, path, label, icon, code, sort_order, is_enabled
FROM menu WHERE is_enabled = 1 ORDER BY sort_order;
```

map เป็น `MenuRow[]` แล้วส่งเข้า `buildMenuTree(rows)`

---

# รายการโปรด (`favorites.json` → `rows[]`)

อ้างอิง `menuId` ไปที่ `id` ใน `menu.json` (ต้องเป็น **page** ที่มี `path`)

## คอลัมน์ (FavoriteRow)

| ฟิลด์ | ความหมาย |
|--------|----------|
| `menuId` | FK → `menu.id` |
| `label` | ชื่อแสดง (optional — ไม่ใส่ใช้จาก menu) |
| `icon` | Bootstrap Icons (optional) |
| `sortOrder` | เรียงในแท็บรายการโปรด |
| `isEnabled` | `false` = ซ่อน |

## เพิ่มรายการโปรด

```json
{
  "menuId": "pmms03",
  "sortOrder": 6
}
```

โหลดผ่าน `getMenu()` → `resolveFavorites()` → แสดงใน Sidebar แท็บ **รายการโปรด**

## จาก DB (อนาคต)

```sql
SELECT menu_id, sort_order FROM user_favorites WHERE user_id = ? ORDER BY sort_order;
```
