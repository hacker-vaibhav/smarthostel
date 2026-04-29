const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { sendOTP } = require('../services/emailService');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
router.post('/send-otp', async (req, res) => {
  let email = '';
  let otpCode = '';

  try {
    ({ email } = req.body);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    otpCode = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'INSERT INTO otps (email, otp, expiry) VALUES ($1, $2, $3)',
      [email, otpCode, expiry]
    );

    await sendOTP(email, otpCode);

    res.json({ message: 'OTP sent successfully', email });
  } catch (error) {
    console.error('Error sending OTP:', error);

    if (process.env.NODE_ENV === 'development') {
      return res.json({
        message: 'OTP generated successfully',
        email,
        devOtp: otpCode || null,
        warning: 'Email delivery failed in development; use the OTP shown below.',
      });
    }

    res.status(503).json({ message: 'Error sending OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    const result = await pool.query(
      'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND expiry > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE otps SET verified = TRUE WHERE id = $1', [result.rows[0].id]);

    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Register after OTP verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

    const otpResult = await pool.query(
      'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND verified = TRUE',
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: 'Email not verified. Please verify OTP first.' });
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, phone, hashedPassword, 'student']
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;
