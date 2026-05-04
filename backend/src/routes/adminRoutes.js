// BACKEND: routes/adminRoutes.js
// ✅ Import names match adminController exports exactly
// ✅ router.use(protect, adminOnly) applies to all routes below it
// ✅ No duplicate protect/adminOnly on individual routes

import express     from 'express';
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
  getRunners,
  suspendRunner,
  liftSuspension,
  nudgeRunner,
  payoutRunner,        // ✅ correct name
  payoutAllEligible,   // ✅ correct name
  disburseEarnings,
  unlockMatureEarnings,
  refundUser,
  getRunnerEarnings,
  paystackWebhook
} from '../controllers/adminController.js';

const router = express.Router();



// Apply protect + adminOnly to every route in this file
router.use(protect, adminOnly);

router.post('/webhook/paystack', paystackWebhook);


// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats',                       getDashboardStats);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',                       getAllUsers);

// ── Deliveries ────────────────────────────────────────────────────────────────
router.get('/deliveries',                  getAllDeliveries);

// ── Dispatcher applications ───────────────────────────────────────────────────
router.get('/dispatchers/pending',         getPendingDispatchers);
router.put('/dispatchers/:id/interview', scheduleInterview);
router.put('/dispatchers/:id/approve',     approveDispatcher);
router.put('/dispatchers/:id/reject',      rejectDispatcher);

// ── Runner management ─────────────────────────────────────────────────────────
router.get('/runners',                     getRunners);
router.put('/runners/:id/suspend',         suspendRunner);
router.put('/runners/:id/lift-suspension', liftSuspension);
router.post('/runners/:id/nudge',          nudgeRunner);
router.post('/runners/:id/payout',         payoutRunner);         // ✅
router.post('/runners/:id/disburse',       disburseEarnings);     // alias kept
router.get('/runners/:id/earnings',        getRunnerEarnings);
router.post('/runners/payout-all',         payoutAllEligible);    // ✅ must be before /:id routes

// ── Financial ─────────────────────────────────────────────────────────────────
router.post('/refund',                     refundUser);
router.post('/unlock-earnings',            unlockMatureEarnings);

export default router;