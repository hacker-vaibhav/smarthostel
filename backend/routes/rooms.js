const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Error fetching room' });
  }
});

// Book room (requires authentication)
router.post('/:id/book', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Lock the room row so concurrent requests cannot overbook it.
    const roomResult = await client.query(
      'SELECT * FROM rooms WHERE id = $1 FOR UPDATE',
      [roomId]
    );

    if (roomResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Room not found' });
    }

    const room = roomResult.rows[0];

    if (room.occupied_count >= room.capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Room is full' });
    }

    const existingBooking = await client.query(
      'SELECT * FROM bookings WHERE user_id = $1 AND status = $2 FOR UPDATE',
      [userId, 'active']
    );

    if (existingBooking.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'You already have an active booking' });
    }

    const bookingResult = await client.query(
      'INSERT INTO bookings (user_id, room_id, check_in_date, status) VALUES ($1, $2, NOW(), $3) RETURNING *',
      [userId, roomId, 'active']
    );

    const occupancyUpdate = await client.query(
      'UPDATE rooms SET occupied_count = occupied_count + 1 WHERE id = $1 AND occupied_count < capacity RETURNING *',
      [roomId]
    );

    if (occupancyUpdate.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Room is full' });
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Room booked successfully',
      booking: bookingResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error booking room:', error);
    res.status(500).json({ message: 'Error booking room' });
  } finally {
    client.release();
  }
});

// Get user's bookings
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const requestedUserId = Number(req.params.userId);
    const currentUserId = Number(req.user.id);
    const isPrivileged = ['admin', 'staff', 'warden'].includes(req.user.role);

    if (!isPrivileged && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT b.*, r.room_number, r.capacity
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

module.exports = router;
