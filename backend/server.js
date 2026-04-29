require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/roommate', require('./routes/roommate'));

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  // Listen for new complaints
  socket.on('complaint-submitted', (data) => {
    io.emit('new-complaint', data);
    console.log('📢 New complaint broadcast:', data);
  });

  // Listen for status updates
  socket.on('complaint-status-updated', (data) => {
    io.emit('complaint-updated', data);
    console.log('📢 Complaint status updated broadcast:', data);
  });

  // Listen for upvotes
  socket.on('complaint-upvoted', (data) => {
    io.emit('complaint-voted', data);
    console.log('📢 Complaint upvoted broadcast:', data);
  });
});

// Export io for use in routes
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: '✅ Smart Hostel Backend is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Smart Hostel Backend running on http://localhost:${PORT}`);
  console.log(`📚 Database: ${process.env.DB_NAME}`);
  console.log(`🤖 AI Service: Ready`);
  console.log(`📧 Email Service: Ready`);
  console.log(`🔌 WebSocket: Ready\n`);
});

module.exports = { app, io };
