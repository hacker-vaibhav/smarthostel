const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM notifications
       WHERE (
         $1::text = 'admin'
         OR user_id = $2
         OR (user_id IS NULL AND tenant_id = $3)
       )
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.role, req.user.id, req.user.tenant_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3 OR tenant_id = $4)
       RETURNING *`,
      [req.params.id, req.user.role, req.user.id, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Error marking notification read' });
  }
});

module.exports = router;
