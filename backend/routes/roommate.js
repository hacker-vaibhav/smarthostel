const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { findBestRoommates } = require('../services/aiService');

// Save student preferences
router.post('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { course, year, sleep_schedule } = req.body;

    // Check if preferences already exist
    const checkResult = await pool.query(
      'SELECT * FROM student_preferences WHERE user_id = $1',
      [userId]
    );

    if (checkResult.rows.length > 0) {
      // Update existing
      await pool.query(
        'UPDATE student_preferences SET course = $1, year = $2, sleep_schedule = $3 WHERE user_id = $4',
        [course, year, sleep_schedule, userId]
      );
    } else {
      // Create new
      await pool.query(
        'INSERT INTO student_preferences (user_id, course, year, sleep_schedule) VALUES ($1, $2, $3, $4)',
        [userId, course, year, sleep_schedule]
      );
    }

    res.json({ message: '✅ Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: '❌ Error saving preferences' });
  }
});

// Get roommate suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's preferences
    const prefResult = await pool.query(
      'SELECT * FROM student_preferences WHERE user_id = $1',
      [userId]
    );

    if (prefResult.rows.length === 0) {
      return res.status(400).json({ message: '❌ Please set your preferences first' });
    }

    const preferences = prefResult.rows[0];

    // Find best roommates
    const suggestions = await findBestRoommates(userId, preferences);

    res.json({ message: '✅ Roommate suggestions', suggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ message: '❌ Error getting suggestions' });
  }
});

module.exports = router;
