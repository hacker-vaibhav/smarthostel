const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken, authorizeRole(['admin', 'management']));

router.get('/students', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.role, u.tenant_id, t.name AS tenant_name,
         r.room_number,
         COALESCE(open_complaints.count, 0) AS open_complaints,
         COALESCE(payments.pending_amount, 0) AS pending_amount
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN bookings b ON b.user_id = u.id AND b.status = 'active'
       LEFT JOIN rooms r ON r.id = b.room_id
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS count
         FROM complaints
         WHERE status <> 'completed'
         GROUP BY user_id
       ) open_complaints ON open_complaints.user_id = u.id
       LEFT JOIN (
         SELECT user_id, SUM(amount) AS pending_amount
         FROM payments
         WHERE status = 'pending'
         GROUP BY user_id
       ) payments ON payments.user_id = u.id
       WHERE u.role = 'student'
       AND ($1::text = 'admin' OR u.tenant_id = $2)
       ORDER BY u.name`,
      [req.user.role, req.user.tenant_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

router.get('/management', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.role, u.tenant_id, t.name AS tenant_name,
         s.role AS staff_role, COALESCE(s.current_tasks, 0) AS current_tasks, COALESCE(s.max_tasks, 5) AS max_tasks
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.role = 'management'
       AND ($1::text = 'admin' OR u.tenant_id = $2)
       ORDER BY t.name, u.name`,
      [req.user.role, req.user.tenant_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching management users:', error);
    res.status(500).json({ message: 'Error fetching management users' });
  }
});

router.patch('/management/:id', authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, phone, email, tenant_id } = req.body;
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           tenant_id = COALESCE($4, tenant_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND role = 'management'
       RETURNING id, name, email, phone, role, tenant_id`,
      [name || null, phone || null, email || null, tenant_id || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Management user not found' });
    }

    res.json({ message: 'Management user updated', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating management user:', error);
    res.status(500).json({ message: 'Error updating management user' });
  }
});

router.get('/students/:id/complaints', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, s.name AS assigned_to_name
       FROM complaints c
       LEFT JOIN users s ON c.assigned_to = s.id
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1
       AND ($2::text = 'admin' OR u.tenant_id = $3)
       ORDER BY
         CASE WHEN c.status = 'escalated' THEN 0 ELSE 1 END,
         c.created_at DESC`,
      [req.params.id, req.user.role, req.user.tenant_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching student complaints:', error);
    res.status(500).json({ message: 'Error fetching student complaints' });
  }
});

router.get('/students/:id/payments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       AND ($2::text = 'admin' OR u.tenant_id = $3)
       ORDER BY p.created_at DESC`,
      [req.params.id, req.user.role, req.user.tenant_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ message: 'Error fetching student payments' });
  }
});

router.patch('/students/:id', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       AND role = 'student'
       AND ($5::text = 'admin' OR tenant_id = $6)
       RETURNING id, name, email, phone, role, tenant_id`,
      [name || null, phone || null, email || null, req.params.id, req.user.role, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated', student: result.rows[0] });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student' });
  }
});

module.exports = router;
