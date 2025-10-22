import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './auth.js';
import tripRoutes from './trips.js';
import bookingRoutes from './booking.js';
import recommendationRoutes from './recommendations.js';
//import aiRoutes from './ai.js'; 



dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/recommendations', recommendationRoutes);
//app.use('/api/ai', aiRoutes); // ← เพิ่มบรรทัดนี้

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TrailTeller API with AI Trip Planning',
    version: '1.0.0',
    features: [
      'AI Trip Generation',
      'Destination Suggestions',
      'AI Chat Assistant',
      'Trip Optimization'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`💾 Database: Neon PostgreSQL with Drizzle ORM`);
  console.log(`🤖 AI Features: Enabled (Mock Mode)`);
});

process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;