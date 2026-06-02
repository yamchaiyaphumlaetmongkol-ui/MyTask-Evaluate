-- Add NextAuth tables and user columns for database-backed sessions
BEGIN;

-- Alter User table to support NextAuth fields (case-sensitive "User" mapped table)
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS email_verified TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS image TEXT;

-- Create account table
CREATE TABLE IF NOT EXISTS account (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state TEXT,
  refresh_token_expires_in INT,
  CONSTRAINT fk_account_user
    FOREIGN KEY (user_id)
    REFERENCES "User"(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_account_provider_provider_account_id
    UNIQUE (provider, provider_account_id)
);

-- Create session table
CREATE TABLE IF NOT EXISTS session (
  id VARCHAR(255) PRIMARY KEY,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id VARCHAR(255) NOT NULL,
  expires TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT fk_session_user
    FOREIGN KEY (user_id)
    REFERENCES "User"(id)
    ON DELETE CASCADE
);

-- Create verification_token table
CREATE TABLE IF NOT EXISTS verification_token (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires TIMESTAMPTZ(6) NOT NULL,
  PRIMARY KEY (identifier, token)
);

COMMIT;
