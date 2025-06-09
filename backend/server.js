// server.js - Fixed version
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const creatorRoutes = require('./routes/creator');
const chatroomRoutes = require('./routes/chatroom');
const messageRoutes = require('./routes/message');
const zegoRoutes = require('./routes/zego');
const quotationRoutes = require('./routes/quotation');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check - moved before other routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/chatroom', chatroomRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/zego', zegoRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/contract', require('./routes/contract'));
// Error handling middleware
app.use(errorHandler);

// 404 handler - must be last
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     error: 'Route not found',
//     path: req.originalUrl 
//   });
// });

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;