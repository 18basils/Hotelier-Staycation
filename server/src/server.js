import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { onRequest } from 'firebase-functions/v2/https';
import { seedFirestore } from './seed-firestore.js';
import { apiLimiter, authLimiter, sensitiveActionLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import roomRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservations.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import couponRoutes from './routes/coupons.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Managed centrally in firebase.json
  crossOriginEmbedderPolicy: false
}));
app.use(cookieParser());

// Explicit CORS Whitelist to avoid permissive cross-origin access
const allowedOrigins = [
  'https://hotelierstays.web.app',
  'https://hotelierstays.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, same-origin) or listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Cross-Origin Request Blocked by CORS Policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Auto-seed Firestore on first live request if empty
let isSeeded = false;
app.use(async (req, res, next) => {
  if (!isSeeded && (process.env.K_SERVICE || process.env.FUNCTION_TARGET)) {
    isSeeded = true;
    seedFirestore().catch((err) => console.error('Auto-seed check error:', err));
  }
  next();
});

// Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Firebase Cloud Functions & Cloud Firestore',
    projectId: process.env.GCLOUD_PROJECT || 'hotelierstays',
    timestamp: new Date().toISOString(),
    service: 'Hotelier Staycation API'
  });
});

// Manual seed trigger (if ever needed)
app.post('/api/seed', async (req, res) => {
  try {
    await seedFirestore(true);
    res.json({ message: 'Firestore force re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred' });
});

// 1. Export as Firebase Cloud Function (2nd Gen, region asia-south1 Mumbai)
export const api = onRequest(
  {
    region: 'asia-south1',
    cors: allowedOrigins,
    maxInstances: 10
  },
  app
);

// 2. Standalone execution for local development (only when explicitly requested)
if (process.env.STANDALONE === 'true') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🏨 Hotelier Backend API Server Started (Local)`);
    console.log(`🚀 Running at: http://localhost:${PORT}`);
    console.log(`🔥 Connected to Firestore project: ${process.env.GCLOUD_PROJECT || 'hotelierstays'}`);
    console.log(`===============================================`);
  });
}

export default app;
