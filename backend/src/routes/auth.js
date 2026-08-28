import express from 'express';

import {
  register,
  loginUser,
  getMe,
  verifyEmail,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendVerification
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

router.get('/verify/:token', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

router.post('/resend-verification', resendVerification);

router.get('/status', (req, res) =>
  res.json({ status: "Auth routes are active" })
);

export default router;