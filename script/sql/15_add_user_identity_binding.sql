-- Add identity binding table: login email <-> pm_employee
BEGIN;

CREATE TABLE IF NOT EXISTS user_identity_binding (
  id BIGSERIAL PRIMARY KEY,
  login_email VARCHAR(255) NOT NULL UNIQUE,
  employee_id BIGINT NOT NULL UNIQUE,
  created_by_email VARCHAR(255),
  updated_by_email VARCHAR(255),
  created_date TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_date TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_identity_binding_employee
    FOREIGN KEY (employee_id)
    REFERENCES pm_employee(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_identity_binding_employee
  ON user_identity_binding(employee_id);

COMMIT;
