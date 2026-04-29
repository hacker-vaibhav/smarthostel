const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { notifyPaymentReminder } = require('../services/notificationService');

// Get user's payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name, u.email, t.name as tenant_name
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN tenants t ON p.tenant_id = t.id
      WHERE (
        $1::text = 'admin'
        OR ($1::text = 'management' AND p.tenant_id = $2)
        OR ($1::text = 'student' AND p.user_id = $3)
      )
       ORDER BY p.created_at DESC`,
      [req.user.role, req.user.tenant_id, req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Mark payment as completed
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.id;

    // Verify payment belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND user_id = $2 AND tenant_id = $3',
      [paymentId, userId, req.user.tenant_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status only if it is still pending
    const result = await pool.query(
      `UPDATE payments
       SET status = $1, paid_date = NOW()
       WHERE id = $2 AND user_id = $3 AND status = 'pending'
       RETURNING *`,
      ['completed', paymentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Payment cannot be completed in its current state' });
    }

    res.json({
      message: 'Payment marked as completed',
      payment: result.rows[0],
    });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ message: 'Error completing payment' });
  }
});

// Send payment reminder (admin only)
router.post('/:id/remind', authenticateToken, authorizeRole(['admin', 'management']), async (req, res) => {
  try {
    const paymentId = req.params.id;

    const result = await pool.query(
      `SELECT p.*, u.name, u.email
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND ($2::text = 'admin' OR p.tenant_id = $3)`,
      [paymentId, req.user.role, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await notifyPaymentReminder(result.rows[0]);

    res.json({ message: 'Payment reminder sent' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Error sending reminder' });
  }
});

module.exports = router;
