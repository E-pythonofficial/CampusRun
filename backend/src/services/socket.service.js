// BACKEND: src/services/socket.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Singleton pattern — avoids circular import issues.
// 1. app.js calls initSocket(httpServer) once on startup.
// 2. Any controller imports the emit helpers directly — no need to touch io.
// ─────────────────────────────────────────────────────────────────────────────

import { Server } from 'socket.io';

let io = null;

// ── Initialize — call this ONCE in app.js ─────────────────────────────────────
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Redefine or import allowed origins here
        const allowed = [process.env.CLIENT_URL, 'http://localhost:8080', 'http://localhost:5000'];
        if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Socket CORS Error'));
        }
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Admin joins a room to get real-time application notifications
    socket.on('join:admin', () => {
      socket.join('admins');
      console.log(`🛡️  Admin joined room: ${socket.id}`);
    });

    // Runner joins their personal room for order/delivery notifications
    socket.on('join:runner', (runnerId) => {
      socket.join(`runner:${runnerId}`);
      console.log(`🏃 Runner ${runnerId} joined their room`);
    });

    // Requester joins their personal room for delivery status updates
    socket.on('join:requester', (requesterId) => {
      socket.join(`requester:${requesterId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// ── Internal getter — throws if not initialized ───────────────────────────────
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket(httpServer) first in app.js.');
  }
  return io;
};

// ─────────────────────────────────────────────────────────────────────────────
// EMIT HELPERS
// Import only what you need in each controller — never import io directly.
// ─────────────────────────────────────────────────────────────────────────────

// ── Used in: runnerController.js (submitApplication) ─────────────────────────
// Pushes a new dispatcher card to the admin dashboard instantly
export const emitToAdmin = (event, data) => {
  getIO().to('admins').emit(event, data);
};

// ── Used in: adminController.js (if needed for future admin→runner messages) ──
export const emitToRunner = (runnerId, event, data) => {
  getIO().to(`runner:${runnerId}`).emit(event, data);
};

// ── Used in: paymentController.js (after payment verified) ───────────────────
// Broadcast new available order to ALL connected runners
export const emitToAll = (event, data) => {
  getIO().emit(event, data);
};

// ── Used in: runnerController.js (after delivery confirmed) ──────────────────
// Notify the requester their item is on the way / delivered
export const emitToRequester = (requesterId, event, data) => {
  getIO().to(`requester:${requesterId}`).emit(event, data);
};

// ── Convenience: notify admins of any event ───────────────────────────────────
export const emitToAdmins = (event, data) => {
  getIO().to('admins').emit(event, data);
};