// import express from 'express';
// import { protect }   from '../middleware/authMiddleware.js';
// import { adminOnly } from '../middleware/adminMiddleware.js';
// import {
//   getDashboardStats, getAllUsers, getPendingDispatchers,
//   scheduleInterview, approveDispatcher, rejectDispatcher,
//   suspendRunner, liftSuspension, nudgeRunner,
//   disburseEarnings, unlockMatureEarnings,
//   refundUser, getAllDeliveries, getRunnerEarnings,
// } from '../controllers/adminController.js';
// import {
//   uploadDocuments, verifyDispatcherDocuments,
// } from '../controllers/verificationController.js';

// const router = express.Router();

// // Stats & data
// router.get('/stats',                          protect, adminOnly, getDashboardStats);
// router.get('/users',                          protect, adminOnly, getAllUsers);
// router.get('/deliveries',                     protect, adminOnly, getAllDeliveries);

// // Dispatcher applications
// router.get('/dispatchers/pending',            protect, adminOnly, getPendingDispatchers);
// router.put('/dispatchers/:id/interview',      protect, adminOnly, scheduleInterview);
// router.put('/dispatchers/:id/approve',        protect, adminOnly, approveDispatcher);
// router.put('/dispatchers/:id/reject',         protect, adminOnly, rejectDispatcher);

// // Runner management
// router.put('/runners/:id/suspend',            protect, adminOnly, suspendRunner);
// router.put('/runners/:id/lift-suspension',    protect, adminOnly, liftSuspension);
// router.post('/runners/:id/nudge',             protect, adminOnly, nudgeRunner);
// router.post('/runners/:id/disburse',          protect, adminOnly, disburseEarnings);
// router.get('/runners/:id/earnings',           protect, adminOnly, getRunnerEarnings);

// // Financial
// router.post('/refund',                        protect, adminOnly, refundUser);
// router.post('/unlock-earnings',               protect, adminOnly, unlockMatureEarnings);

// // Document upload & AI verification (called during registration — no adminOnly)
// router.post('/upload-documents',              protect, uploadDocuments);
// router.post('/verify-documents',              protect, verifyDispatcherDocuments);

// export default router;

import express from 'express';
import { protect }   from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

import {
  getDashboardStats,
  getAllUsers,
  getAllDeliveries,
  getPendingDispatchers,
  scheduleInterview,
  approveDispatcher,
  rejectDispatcher,
  // getRunners,
  // suspendRunner,
  // liftSuspension,
  // nudgeRunner,
  // payoutRunner
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', protect, adminOnly, getDashboardStats);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', getAllUsers);

// ── Deliveries ────────────────────────────────────────────────────────────────
router.get('/deliveries', getAllDeliveries);

// ── Dispatcher Applications ───────────────────────────────────────────────────
router.get('/dispatchers/pending', getPendingDispatchers);
router.put('/dispatchers/:id/interview', scheduleInterview);
router.put('/dispatchers/:id/approve', approveDispatcher);
router.put('/dispatchers/:id/reject', rejectDispatcher);

// ── Runner Management ─────────────────────────────────────────────────────────
// router.get('/runners', getRunners);
// router.put('/runners/:id/suspend', suspendRunner);
// router.put('/runners/:id/lift-suspension', liftSuspension);
// router.post('/runners/:id/nudge', nudgeRunner);
// router.post('/runners/:id/payout', payoutRunner);
// router.post('/runners/payout-all', payoutAllEligible);

export default router;