// BACKEND: app.js
// ✅ Socket.io wired in — use httpServer.listen instead of app.listen
// ✅ io exported so controllers can emit events
// ✅ Runner routes registered at /api/runner
// ✅ Admin routes registered at /api/admin

import express    from 'express';
import cors       from 'cors';
import dotenv     from 'dotenv';
import path       from 'path';
import fs         from 'fs';
import http       from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

import authRoutes   from './routes/auth.js';
import orderRoutes  from './routes/orderRoutes.js';
import adminRoutes  from './routes/adminRoutes.js';
import runnerRoutes from './routes/runnerRoutes.js';

dotenv.config();

const app        = express();
const httpServer = http.createServer(app);   // wrap express — required for Socket.io

// ── Socket.io setup ───────────────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin:      process.env.CLIENT_URL || 'http://localhost:8080',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Admin joins a room to receive real-time application notifications
  socket.on('join:admin', () => {
    socket.join('admins');
    console.log(`🛡️  Admin joined room: ${socket.id}`);
  });

  // Runner joins their personal room (for live order push notifications later)
  socket.on('join:runner', (runnerId) => {
    socket.join(`runner:${runnerId}`);
    console.log(`🏃 Runner ${runnerId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Paths ─────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created missing uploads directory');
}

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors({
  origin:         process.env.CLIENT_URL || 'http://localhost:8080',
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api/runner', runnerRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    message:   'Campus Run API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message,
    stack:   process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
// ⚠️  Use httpServer.listen (NOT app.listen) so Socket.io works
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is live on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io attached`);
});