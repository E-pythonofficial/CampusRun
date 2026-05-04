import express from 'express';
import { protect, protectLite } from '../middleware/authMiddleware.js';

import {
  submitApplication,
  getDispatcherDashboard,
  acceptRun,
  acceptOrder,
  markPickedUp,
  completeRun,
  getActiveRun,
  getRunHistory,
  getMyEarnings,
  getRunnerStatus,
  saveBankDetails,
  getNearbyRunners,
  updateRunnerLocation,
  locationUnload,
  getDispatcherDeliveries,
  getDispatcherStats,
  getDispatcherLeaderboard,
  getDispatcherEarnings,
  getNotificationPreferences,
  saveNotificationPreferences,
  getPaymentMethod,
  getBanks,
  verifyBankAccount,
} from '../controllers/runnerController.js';

const router = express.Router();

// ── Application ───────────────────────────────────────────────────────────────
router.post('/apply',  protectLite, submitApplication);
router.get('/status',  protectLite, getRunnerStatus);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', protect, getDispatcherDashboard);
router.get('/active',    protect, getActiveRun);
router.get('/history',   protect, getRunHistory);
router.get('/earnings',  protect, getMyEarnings);

// ── Dispatcher dashboard data ─────────────────────────────────────────────────
router.get('/deliveries',                protect, getDispatcherDeliveries);
router.get('/stats',                     protect, getDispatcherStats);
router.get('/leaderboard',               protect, getDispatcherLeaderboard);
router.get('/earnings-breakdown',        protect, getDispatcherEarnings);
router.get('/notification-preferences',  protect, getNotificationPreferences);
router.post('/notification-preferences', protect, saveNotificationPreferences);
router.get('/payment-method',            protect, getPaymentMethod);
router.get('/banks',                     protect, getBanks);
router.post('/verify-account',           protect, verifyBankAccount);

// ── Location ──────────────────────────────────────────────────────────────────
router.get('/nearby',           protect, getNearbyRunners);
router.post('/location',        protect, updateRunnerLocation);
router.post('/location-unload',          locationUnload);

// ── Order actions ─────────────────────────────────────────────────────────────
router.post('/accept-run/:id',       protect, acceptRun);
router.post('/:orderId/accept',      protect, acceptOrder);
router.put('/picked-up/:id',         protect, markPickedUp);
router.post('/complete-run/:id',     protect, completeRun);
router.post('/:orderId/confirm-pin', protect, completeRun);

// ── Bank details ──────────────────────────────────────────────────────────────
router.post('/bank-details', protect, saveBankDetails);

export default router;