import express from 'express';
import upload from '../lib/cloudinary.js';
// import register from '../controllers/authController.js';
// Added the new controller functions to the import list
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

/**
 * @route   POST /api/auth/register
 */
router.post('/register', 
  upload.fields([
    { name: 'idCard', maxCount: 1 },
    {name: 'selfie', maxCount: 1 }
  ]),
  register); 

/**
 * @route   POST /api/auth/login
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 */
router.get('/me', protect, getMe);

/**
 * @route   GET /api/auth/verify/:token
 */
router.get('/verify/:token', verifyEmail);

// --- NEW PASSWORD RESET ROUTES ---

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request OTP via email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify the 4-digit code and get a reset token
 * @access  Public
 */
router.post('/verify-otp', verifyOtp);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Set new password using the reset token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    2. ROUTE DEFINED HERE
 */
router.post('/resend-verification', resendVerification);

// ---------------------------------

/**
 * @route   GET /api/auth/status
 */
router.get('/status', (req, res) => res.json({ status: "Auth routes are active" }));




export default router;