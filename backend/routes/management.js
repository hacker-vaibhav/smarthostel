const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { rebalanceOverloadedStaff } = require('../services/staffService');

router.use(authenticateToken, authorizeRole(['admin', 'management']));

router.get('/dashboard', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const tenantFilter = isAdmin ? '' : 'WHERE tenant_id = $1';
    const tenantJoinFilter = isAdmin ? '' : 'WHERE t.id = $1';
    const params = isAdmin ? [] : [req.user.tenant_id];

    const [
      totals,
      complaintsPerHostel,
      revenuePerHostel,
      staffWorkload,
      complaintTrends,
      escalated,
    ] = await Promise.all([
      pool.query(
        `SELECT
          (SELECT COUNT(*) FROM tenants ${isAdmin ? '' : 'WHERE id = $1'}) AS total_hostels,
          (SELECT COUNT(*) FROM users WHERE role = 'student' ${isAdmin ? '' : 'AND tenant_id = $1'}) AS total_students,
          (SELECT COUNT(*) FROM complaints ${tenantFilter}) AS total_complaints,
          (SELECT COUNT(*) FROM complaints WHERE status = 'escalated' ${isAdmin ? '' : 'AND tenant_id = $1'}) AS escalated_complaints,
          (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' ${isAdmin ? '' : 'AND tenant_id = $1'}) AS total_revenue`,
        params
      ),
      pool.query(
        `SELECT t.name AS hostel, COUNT(c.id) AS complaints
         FROM tenants t
         LEFT JOIN complaints c ON c.tenant_id = t.id
         ${tenantJoinFilter}
         GROUP BY t.id, t.name
         ORDER BY complaints DESC`,
        params
      ),
      pool.query(
        `SELECT t.name AS hostel, COALESCE(SUM(p.amount), 0) AS revenue
         FROM tenants t
         LEFT JOIN payments p ON p.tenant_id = t.id AND p.status = 'completed'
         ${tenantJoinFilter}
         GROUP BY t.id, t.name
         ORDER BY revenue DESC`,
        params
      ),
      pool.query(
        `SELECT t.name AS hostel, u.name AS staff_name, s.role, s.current_tasks, COALESCE(s.max_tasks, 5) AS max_tasks
         FROM staff s
         JOIN users u ON u.id = s.user_id
         JOIN tenants t ON t.id = s.tenant_id
         ${isAdmin ? '' : 'WHERE s.tenant_id = $1'}
         ORDER BY s.current_tasks DESC, u.name`,
        params
      ),
      pool.query(
        `SELECT DATE(created_at) AS date, COUNT(*) AS complaints
         FROM complaints
         WHERE created_at >= NOW() - INTERVAL '14 days'
         ${isAdmin ? '' : 'AND tenant_id = $1'}
         GROUP BY DATE(created_at)
         ORDER BY date`,
        params
      ),
      pool.query(
        `SELECT c.*, t.name AS tenant_name, u.name AS user_name, s.name AS assigned_to_name
         FROM complaints c
         JOIN tenants t ON t.id = c.tenant_id
         JOIN users u ON u.id = c.user_id
         LEFT JOIN users s ON s.id = c.assigned_to
         WHERE c.status = 'escalated'
         ${isAdmin ? '' : 'AND c.tenant_id = $1'}
         ORDER BY c.updated_at DESC, c.created_at DESC`,
        params
      ),
    ]);

    res.json({
      totals: totals.rows[0],
      complaintsPerHostel: complaintsPerHostel.rows,
      revenuePerHostel: revenuePerHostel.rows,
      staffWorkload: staffWorkload.rows,
      complaintTrends: complaintTrends.rows,
      escalatedComplaints: escalated.rows,
    });
  } catch (error) {
    console.error('Error fetching management dashboard:', error);
    res.status(500).json({ message: 'Error fetching management dashboard' });
  }
});

router.post('/rebalance/:tenantId', async (req, res) => {
  try {
    await rebalanceOverloadedStaff(req.params.tenantId);
    res.json({ message: 'Staff workload rebalanced' });
  } catch (error) {
    console.error('Error rebalancing staff:', error);
    res.status(500).json({ message: 'Error rebalancing staff' });
  }
});

module.exports = router;
