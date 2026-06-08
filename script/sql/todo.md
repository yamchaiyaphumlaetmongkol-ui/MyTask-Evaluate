You are a senior Next.js + Prisma + security-conscious TypeScript engineer.

Implement a **local email/password login** (no Keycloak/Auth.js) using **ClickUp email** as the username source. The system must support:

- Admin login
- First-login forced password change
- Admin-only password reset UI in PMMS01 employee edit screen

This prompt is for completing the work end-to-end.

---

## Product requirements (must implement)

### 1) Authentication model

- Login uses:
  - **username = email** (specifically the ClickUp email field stored on employee)
  - **password** (stored securely as a hash)
- When a user is added:
  - create an auth account row with:
    - username = ClickUp email
    - password = `P@ssword` (temporary)
    - `mustChangePassword = true`
- On **first login**, user must change password:
  - input `newPassword` + `confirmPassword`
  - validate match + strength rules
  - update hash
  - set `mustChangePassword = false`
- Admin account:
  - username: `admin`
  - password: `Admin1234*`
  - always allowed to login
- Admin-only: In PMMS01 employee edit page, show a **password reset section** visible only to admin.

### 2) Authorization rules

- Only admin can:
  - reset other users’ passwords
  - see the admin-only password reset fields on PMMS01 edit screen
- Non-admin users:
  - can change their own password only via the forced first-login change page, and optionally a profile change password page (if you add it)

### 3) UI/UX

- Replace “select user” identity gate with real login gate:
  - Not logged in → redirect to `/auth/login`
- Login page:
  - fields: username/email, password
  - on success:
    - if `mustChangePassword` → redirect `/auth/change-password`
    - else → go `/`
- Change password page:
  - fields: newPassword, confirmPassword
  - show clear Thai error messages
- PMMS01 edit page:
  - if current session user is admin:
    - show section “รีเซ็ตรหัสผ่านผู้ใช้งาน”
    - admin can set password for that employee’s auth account (or initialize if missing)
    - optionally set `mustChangePassword = true` after reset

### 4) Data model (Prisma)

Create new auth tables (or reuse existing if present, but do not rely on next-auth tables):

- `AppUserAuth` (name can vary; must be clear)
  - `id`
  - `username` (unique) — store email or "admin"
  - `passwordHash`
  - `role` enum/string: `admin` | `user`
  - `mustChangePassword` boolean
  - `employeeId` optional FK → `PmEmployee` (null for admin)
  - timestamps
- Ensure `username` uniqueness across admin and employees.

### 5) Password security (must follow)

- Never store plaintext passwords.
- Use a proven password hashing algorithm:
  - **bcrypt** recommended (work factor appropriate)
  - or **argon2** if available
- Implement constant-time compare via library functions.
- Validate password:
  - minimum length (e.g. 8–12)
  - require confirm match
- Do not log passwords.

### 6) Server-side session

Implement your own session mechanism (no Auth.js):
