-- Run this once on an existing smart_hostel database before using the advanced multi-tenant features.

CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tenants (name, code, address)
VALUES ('Smart Hostel Main Campus', 'MAIN', 'Main Campus Block')
ON CONFLICT (code) DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
UPDATE users SET tenant_id = (SELECT id FROM tenants WHERE code = 'MAIN') WHERE tenant_id IS NULL;
UPDATE users SET role = 'admin' WHERE role IN ('staff', 'warden');

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
UPDATE rooms SET tenant_id = (SELECT id FROM tenants WHERE code = 'MAIN') WHERE tenant_id IS NULL;
ALTER TABLE rooms ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_room_number_key;

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
UPDATE complaints
SET tenant_id = COALESCE(
  (SELECT tenant_id FROM users WHERE users.id = complaints.user_id),
  (SELECT id FROM tenants WHERE code = 'MAIN')
)
WHERE tenant_id IS NULL;
ALTER TABLE complaints ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
UPDATE payments
SET tenant_id = COALESCE(
  (SELECT tenant_id FROM users WHERE users.id = payments.user_id),
  (SELECT id FROM tenants WHERE code = 'MAIN')
)
WHERE tenant_id IS NULL;
ALTER TABLE payments ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE staff ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS max_tasks INT DEFAULT 5;
UPDATE staff
SET tenant_id = COALESCE(
  (SELECT tenant_id FROM users WHERE users.id = staff.user_id),
  (SELECT id FROM tenants WHERE code = 'MAIN')
)
WHERE tenant_id IS NULL;
ALTER TABLE staff ALTER COLUMN tenant_id SET NOT NULL;

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  tenant_id INT REFERENCES tenants(id),
  user_id INT REFERENCES users(id),
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(50) DEFAULT 'in_app',
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_tenant_room_number ON rooms(tenant_id, room_number);
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_id ON complaints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
