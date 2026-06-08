-- Local login: app_user_auth + app_session
-- Run after 16_add_nextauth_tables.sql (legacy NextAuth tables may coexist)

DO $$ BEGIN
  CREATE TYPE "AppAuthRole" AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS app_user_auth (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role "AppAuthRole" NOT NULL DEFAULT 'user',
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  employee_id BIGINT UNIQUE REFERENCES pm_employee(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_session (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES app_user_auth(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_session_user_id_idx ON app_session(user_id);
CREATE INDEX IF NOT EXISTS app_session_expires_at_idx ON app_session(expires_at);
