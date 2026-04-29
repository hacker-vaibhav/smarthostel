const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const roomScope = (req, id) => {
  if (req.user.role === 'admin') {
    return { query: 'SELECT * FROM rooms WHERE id = $1', params: [id] };
  }
  return { query: 'SELECT * FROM rooms WHERE id = $1 AND tenant_id = $2', params: [id, req.user.tenant_id] };
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = req.user.role === 'admin'
      ? await pool.query('SELECT r.*, t.name AS tenant_name FROM rooms r JOIN tenants t ON r.tenant_id = t.id ORDER BY t.name, r.room_number')
      : await pool.query('SELECT * FROM rooms WHERE tenant_id = $1 ORDER BY room_number', [req.user.tenant_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const requestedUserId = Number(req.params.userId);
    const currentUserId = Number(req.user.id);
    const isPrivileged = ['admin', 'management'].includes(req.user.role);

    if (!isPrivileged && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT b.*, r.room_number, r.capacity, r.tenant_id
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_id = $1
       AND ($2::text = 'admin' OR r.tenant_id = $3)
       ORDER BY b.created_at DESC`,
      [req.params.userId, req.user.role, req.user.tenant_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.post('/:id/assign/:userId', authenticateToken, authorizeRole(['admin', 'management']), async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const scopedRoom = roomScope(req, req.params.id);
    const roomResult = await client.query(`${scopedRoom.query} FOR UPDATE`, scopedRoom.params);

    if (roomResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Room not found' });
    }

    const studentResult = await client.query(
      req.user.role === 'admin'
        ? `SELECT * FROM users WHERE id = $1 AND role = 'student'`
        : `SELECT * FROM users WHERE id = $1 AND tenant_id = $2 AND role = 'student'`,
      req.user.role === 'admin' ? [req.params.userId] : [req.params.userId, req.user.tenant_id]
    );

    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Student not found' });
    }

    const room = roomResult.rows[0];
    if (room.occupied_count >= room.capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Room is full' });
    }

    const existingBooking = await client.query(
      `SELECT * FROM bookings WHERE user_id = $1 AND status = 'active' FOR UPDATE`,
      [req.params.userId]
    );

    if (existingBooking.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Student already has an active booking' });
    }

    const booking = await client.query(
      `INSERT INTO bookings (user_id, room_id, check_in_date, status)
       VALUES ($1, $2, NOW(), 'active')
       RETURNING *`,
      [req.params.userId, req.params.id]
    );

    await client.query('UPDATE rooms SET occupied_count = occupied_count + 1 WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');

    res.status(201).json({ message: 'Room assigned successfully', booking: booking.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning room:', error);
    res.status(500).json({ message: 'Error assigning room' });
  } finally {
    client.release();
  }
});

router.post('/:id/book', authenticateToken, authorizeRole(['student']), async (req, res) => {
  const client = await pool.connect();

  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    await client.query('BEGIN');

    const scopedRoom = roomScope(req, roomId);
    const roomResult = await client.query(`${scopedRoom.query} FOR UPDATE`, scopedRoom.params);

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

    await client.query(
      'UPDATE rooms SET occupied_count = occupied_count + 1 WHERE id = $1 AND occupied_count < capacity',
      [roomId]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'Room booked successfully', booking: bookingResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error booking room:', error);
    res.status(500).json({ message: 'Error booking room' });
  } finally {
    client.release();
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const scopedRoom = roomScope(req, req.params.id);
    const result = await pool.query(scopedRoom.query, scopedRoom.params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Error fetching room' });
  }
});

module.exports = router;
