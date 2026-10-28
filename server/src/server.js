import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { onRequest } from 'firebase-functions/v2/https';
import { seedFirestore } from './seed-firestore.js';

import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import roomRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservations.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');

// Security & Parsing Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(cors({ origin: true }));
app.use(express.json());

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
    cors: true,
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
