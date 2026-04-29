const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const userId = user.user_id || user.id;
    if (!userId || !user.role) {
      return res.status(403).json({ message: 'Invalid token payload' });
    }

    if (user.role !== 'admin' && !user.tenant_id) {
      return res.status(403).json({ message: 'Tenant context missing' });
    }

    req.user = {
      ...user,
      id: userId,
      user_id: userId,
      tenant_id: user.tenant_id || null,
    };

    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

const requireTenantAccess = (getTenantId) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    const tenantId = Number(typeof getTenantId === 'function' ? getTenantId(req) : req.params.tenantId);
    if (!tenantId || tenantId !== Number(req.user.tenant_id)) {
      return res.status(403).json({ message: 'Tenant access denied' });
    }

    next();
  };
};

const tenantScope = (req, tableAlias = '') => {
  if (req.user.role === 'admin') {
    return { clause: '', params: [] };
  }

  const prefix = tableAlias ? `${tableAlias}.` : '';
  return { clause: `${prefix}tenant_id = $1`, params: [req.user.tenant_id] };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  requireTenantAccess,
  tenantScope,
};
