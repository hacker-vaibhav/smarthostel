const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { sendPaymentReminder } = require('../services/emailService');

// Get user's payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT p.*, u.name, u.email
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
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
      'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
      [paymentId, userId]
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
router.post('/:id/remind', authenticateToken, authorizeRole(['admin', 'warden']), async (req, res) => {
  try {
    const paymentId = req.params.id;

    const result = await pool.query(
      `SELECT p.*, u.name, u.email
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = result.rows[0];
    const daysLeft = Math.ceil((new Date(payment.due_date) - new Date()) / (1000 * 60 * 60 * 24));

    await sendPaymentReminder(payment.email, payment.name, daysLeft, payment.amount);

    res.json({ message: 'Payment reminder sent' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Error sending reminder' });
  }
});

module.exports = router;
