const pool = require('../config/database');

const DEFAULT_TENANT_CODE = process.env.DEFAULT_TENANT_CODE || 'MAIN';

const getDefaultTenant = async () => {
  const result = await pool.query(
    `INSERT INTO tenants (name, code, address)
     VALUES ($1, $2, $3)
     ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    ['Smart Hostel Main Campus', DEFAULT_TENANT_CODE, 'Main Campus Block']
  );

  return result.rows[0];
};

const getTenantByCode = async (code) => {
  const result = await pool.query('SELECT * FROM tenants WHERE code = $1', [code || DEFAULT_TENANT_CODE]);
  return result.rows[0] || getDefaultTenant();
};

const scopedTenantId = (user) => {
  if (user.role === 'admin') return null;
  return user.tenant_id;
};

module.exports = {
  getDefaultTenant,
  getTenantByCode,
  scopedTenantId,
};
