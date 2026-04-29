-- Demo accounts for the platform admin and hostel management.
-- Password for all demo accounts: password123

INSERT INTO tenants (name, code, address) VALUES
('Main Campus Hostel', 'MAIN', 'Main Campus'),
('North Block Hostel', 'NORTH', 'North Block')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    address = EXCLUDED.address;

DELETE FROM users WHERE email IN ('admin.north@demo.com');

INSERT INTO users (tenant_id, name, email, phone, password, role)
SELECT id, 'Main Hostel Admin', 'admin.main@demo.com', '9999999999',
'$2a$10$JsxkfbQJngPBO5xjcl6IuO8YRDhRgF1dci/nA6paVtzAL6ZehC.fm', 'admin'
FROM tenants WHERE code = 'MAIN'
ON CONFLICT (email) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    password = EXCLUDED.password,
    role = EXCLUDED.role;

INSERT INTO users (tenant_id, name, email, phone, password, role)
SELECT id, 'Hostel Management Lead', 'management@demo.com', '9999999997',
'$2a$10$JsxkfbQJngPBO5xjcl6IuO8YRDhRgF1dci/nA6paVtzAL6ZehC.fm', 'management'
FROM tenants WHERE code = 'MAIN'
ON CONFLICT (email) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    password = EXCLUDED.password,
    role = EXCLUDED.role;

INSERT INTO users (tenant_id, name, email, phone, password, role)
SELECT id, 'Water Staff', 'water.staff@demo.com', '9999999996',
'$2a$10$JsxkfbQJngPBO5xjcl6IuO8YRDhRgF1dci/nA6paVtzAL6ZehC.fm', 'management'
FROM tenants WHERE code = 'MAIN'
ON CONFLICT (email) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    password = EXCLUDED.password,
    role = EXCLUDED.role;

INSERT INTO users (tenant_id, name, email, phone, password, role)
SELECT id, 'Food Staff', 'food.staff@demo.com', '9999999995',
'$2a$10$JsxkfbQJngPBO5xjcl6IuO8YRDhRgF1dci/nA6paVtzAL6ZehC.fm', 'management'
FROM tenants WHERE code = 'MAIN'
ON CONFLICT (email) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    password = EXCLUDED.password,
    role = EXCLUDED.role;

INSERT INTO users (tenant_id, name, email, phone, password, role)
SELECT id, 'Electrical Staff', 'electrical.staff@demo.com', '9999999994',
'$2a$10$JsxkfbQJngPBO5xjcl6IuO8YRDhRgF1dci/nA6paVtzAL6ZehC.fm', 'management'
FROM tenants WHERE code = 'MAIN'
ON CONFLICT (email) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    password = EXCLUDED.password,
    role = EXCLUDED.role;

INSERT INTO rooms (tenant_id, room_number, capacity, occupied_count, price)
SELECT id, 'A-101', 2, 0, 7500 FROM tenants WHERE code = 'MAIN'
ON CONFLICT (tenant_id, room_number) DO NOTHING;

INSERT INTO rooms (tenant_id, room_number, capacity, occupied_count, price)
SELECT id, 'A-102', 3, 0, 7000 FROM tenants WHERE code = 'MAIN'
ON CONFLICT (tenant_id, room_number) DO NOTHING;

INSERT INTO rooms (tenant_id, room_number, capacity, occupied_count, price)
SELECT id, 'N-201', 2, 0, 8200 FROM tenants WHERE code = 'NORTH'
ON CONFLICT (tenant_id, room_number) DO NOTHING;

INSERT INTO rooms (tenant_id, room_number, capacity, occupied_count, price)
SELECT id, 'N-202', 3, 0, 7800 FROM tenants WHERE code = 'NORTH'
ON CONFLICT (tenant_id, room_number) DO NOTHING;

INSERT INTO staff (tenant_id, user_id, name, role, current_tasks, max_tasks)
SELECT u.tenant_id, u.id, u.name, 'water', 1, 5
FROM users u WHERE u.email = 'water.staff@demo.com'
AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = u.id);

INSERT INTO staff (tenant_id, user_id, name, role, current_tasks, max_tasks)
SELECT u.tenant_id, u.id, u.name, 'food', 2, 5
FROM users u WHERE u.email = 'food.staff@demo.com'
AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = u.id);

INSERT INTO staff (tenant_id, user_id, name, role, current_tasks, max_tasks)
SELECT u.tenant_id, u.id, u.name, 'electrical', 0, 5
FROM users u WHERE u.email = 'electrical.staff@demo.com'
AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = u.id);
