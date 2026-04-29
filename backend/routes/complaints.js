const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { analyzeComplaint } = require('../services/aiService');
const { assignComplaintToStaff } = require('../services/staffService');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/complaints/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Post complaint (requires authentication)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : null;

    if (!text || !imageUrl) {
      return res.status(400).json({ message: 'Complaint text and image are required' });
    }

    // Analyze complaint using AI
    const analysis = await analyzeComplaint(text, imageUrl);

    // Create complaint
    const complaintResult = await pool.query(
      `INSERT INTO complaints
       (user_id, text, image_url, category, priority, summary, suggested_staff, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, text, imageUrl, analysis.category, analysis.priority, analysis.summary, analysis.suggested_staff, 'pending']
    );

    const complaint = complaintResult.rows[0];

    // Assign to staff automatically
    await assignComplaintToStaff(complaint.id, analysis.priority, analysis.suggested_staff, analysis.category);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
      analysis,
    });
  } catch (error) {
    console.error('Error posting complaint:', error);
    res.status(500).json({ message: 'Error posting complaint', error: error.message });
  }
});

// Get all complaints for authenticated users.
// Private fields like email are intentionally excluded from the public feed.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.name as user_name, s.name as assigned_to_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.assigned_to = s.id
      ORDER BY
        CASE c.priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        c.votes_count DESC,
        c.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Get user's complaints
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const requestedUserId = Number(req.params.userId);
    const currentUserId = Number(req.user.id);
    const isPrivileged = ['admin', 'staff', 'warden'].includes(req.user.role);

    if (!isPrivileged && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT c.*, u.name as user_name, s.name as assigned_to_name
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Update complaint status (admin/staff only)
router.patch('/:id/status', authenticateToken, authorizeRole(['admin', 'staff', 'warden']), async (req, res) => {
  try {
    const { status } = req.body;
    const complaintId = req.params.id;

    const result = await pool.query(
      'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, complaintId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint status updated',
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ message: 'Error updating complaint' });
  }
});

// Upvote complaint
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;

    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND complaint_id = $2',
      [userId, complaintId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({ message: 'You already voted for this complaint' });
    }

    // Add vote
    await pool.query(
      'INSERT INTO votes (user_id, complaint_id) VALUES ($1, $2)',
      [userId, complaintId]
    );

    // Update votes count
    const result = await pool.query(
      'UPDATE complaints SET votes_count = votes_count + 1 WHERE id = $1 RETURNING *',
      [complaintId]
    );

    res.json({
      message: 'Upvote registered',
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error('Error upvoting complaint:', error);
    res.status(500).json({ message: 'Error upvoting complaint' });
  }
});

// Get complaint votes count
router.get('/:id/votes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT votes_count FROM complaints WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ votes_count: result.rows[0].votes_count });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ message: 'Error fetching votes' });
  }
});

module.exports = router;
