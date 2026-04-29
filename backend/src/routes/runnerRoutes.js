import express        from 'express';
import { protectLite } from '../middleware/authMiddleware.js';
import {
  submitApplication,
  getRunnerStatus,
  getRunnerEarnings,
} from '../controllers/runnerController.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// WHY protectLite and NOT protect?
//
// `protect` blocks any DISPATCHER where isApproved = false.
// A runner applicant isn't approved yet — that IS the purpose of these routes.
// If we used `protect`, they'd get a 403 before submitting or checking status.
//
// `protectLite` only verifies the JWT is valid. No approval gate.
// ─────────────────────────────────────────────────────────────────────────────

// Submit runner application (fills form, uploads docs, writes reason)
router.post('/apply',   protectLite, submitApplication);

// Get own application status — socket fallback + initial page load
router.get('/status',   protectLite, getRunnerStatus);

// Get own earnings breakdown — weekly balance, total earned, recent runs
router.get('/earnings', protectLite, getRunnerEarnings);

export default router;