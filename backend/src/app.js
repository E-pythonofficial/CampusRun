import './config/dns-fix.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { initSocket } from './services/socket.service.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Route Imports
import authRoutes from './routes/auth.js';
// import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import runnerRoutes from './routes/runnerRoutes.js';
import { paystackWebhook } from './controllers/payoutController.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ── Shared CORS Logic ────────────────────────────────────────────────────────
export const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:8080',
  'http://localhost:5000',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // (e.g. Postman, server-to-server requests)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],
};

// Initialize Socket.io
initSocket(httpServer);

//  CORS (must come before routes)
app.use(cors(corsOptions));

// Paystack Webhook  MUST be before express.json() 
// Paystack sends a raw Buffer body. If express.json() runs first it consumes
// the body and our signature check will always fail.
app.post(
  '/api/webhooks/paystack',
  express.raw({ type: 'application/json' }),
  paystackWebhook
);

//  General Middlewares (after webhook) 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//  Static Uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth',   authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api/runner', runnerRoutes);
app.use('/api/upload', uploadRoutes);

//  Health Check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Campus Run API is running 🚀' });
});

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server live on port ${PORT}`);
  console.log(`🔌 Socket.io handshake matched with Express CORS`);
});