import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import bookingRoutes from './routes/booking.js';
import recommendationRoutes from './routes/recommendations.js';
import aiRoutes from './routes/server.js';
import { aiService } from './services/aiservice.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// ==================== Middleware ====================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==================== API Routes ====================

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

// ==================== Health Check ====================

app.get('/', (req, res) => {
  const aiProvider = aiService.getProvider();
  const aiAvailable = aiService.isAvailable();

  res.json({
    success: true,
    message: 'TrailTeller API - Travel Planning Platform',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    
    features: {
      authentication: 'JWT-based',
      trip_planning: 'Full CRUD operations',
      bookings: 'Multi-service booking system',
      recommendations: 'AI-powered suggestions',
      ai_assistant: aiAvailable ? 'Active' : 'Mock mode'
    },

    ai: {
      provider: aiProvider,
      status: aiAvailable ? 'connected' : 'using mock data',
      available_models: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY
      }
    },

    endpoints: {
      auth: '/api/auth',
      trips: '/api/trips',
      bookings: '/api/bookings',
      recommendations: '/api/recommendations',
      ai: '/api/ai'
    },

    database: 'Neon PostgreSQL',
    orm: 'Drizzle ORM'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'TrailTeller API Documentation',
    version: '1.0.0',
    
    endpoints: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me (Protected)',
        update: 'PUT /api/auth/profile (Protected)'
      },
      
      trips: {
        list: 'GET /api/trips (Protected)',
        get: 'GET /api/trips/:id (Protected)',
        create: 'POST /api/trips (Protected)',
        update: 'PUT /api/trips/:id (Protected)',
        delete: 'DELETE /api/trips/:id (Protected)',
        destinations: 'GET /api/trips/destinations (Protected)'
      },
      
      bookings: {
        list: 'GET /api/bookings/trip/:tripId (Protected)',
        create: 'POST /api/bookings (Protected)',
        update: 'PUT /api/bookings/:id (Protected)',
        delete: 'DELETE /api/bookings/:id (Protected)'
      },
      
      recommendations: {
        list: 'GET /api/recommendations (Protected)',
        create: 'POST /api/recommendations (Protected)',
        generate: 'POST /api/recommendations/generate (Protected)',
        delete: 'DELETE /api/recommendations/:id (Protected)'
      },
      
      ai: {
        status: 'GET /api/ai/status (Protected)',
        generate: 'POST /api/ai/generate (Protected)',
        suggest: 'POST /api/ai/suggest (Protected)',
        chat: 'POST /api/ai/chat (Protected)',
        optimize: 'POST /api/ai/optimize/:tripId (Protected)'
      }
    }
  });
});

// ==================== Error Handlers ====================
// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Mongoose/Database errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : undefined,
    timestamp: new Date().toISOString()
  });
});

// ==================== Server Initialization ====================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 TrailTeller API Server Started');
  console.log('='.repeat(60));
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`💾 Database: Neon PostgreSQL`);
  console.log(`🗃️  ORM: Drizzle ORM`);
  
  const aiProvider = aiService.getProvider();
  const aiAvailable = aiService.isAvailable();
  console.log(`🤖 AI Provider: ${aiProvider}`);
  console.log(`✨ AI Status: ${aiAvailable ? '✅ Connected' : '⚠️  Mock Mode'}`);
  
  console.log('='.repeat(60));
  console.log('📡 API Endpoints:');
  console.log(`   • Health: http://localhost:${PORT}/`);
  console.log(`   • Docs: http://localhost:${PORT}/api`);
  console.log(`   • Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   • Trips: http://localhost:${PORT}/api/trips`);
  console.log(`   • AI: http://localhost:${PORT}/api/ai`);
  console.log('='.repeat(60) + '\n');
});

// ==================== Process Handlers ====================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n❌ UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  server.close(() => {
    console.log('💥 Server closed');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n👋 SIGINT received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

export default app;