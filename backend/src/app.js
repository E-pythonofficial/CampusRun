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
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import runnerRoutes from './routes/runnerRoutes.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ── Shared CORS Logic ────────────────────────────────────────────────────────
export const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:8080',
  'http://localhost:5000',
  // 'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.railway.app');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// ── Initialize Socket.io ─────────────────────────────────────────────────────
initSocket(httpServer);

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/runner', runnerRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Campus Run API is running 🚀' });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server live on port ${PORT}`);
  console.log(`🔌 Socket.io handshake matched with Express CORS`);
});