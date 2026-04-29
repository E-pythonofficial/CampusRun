// BACKEND: routes/orderRoutes.js
import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import { verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createOrder);
router.get('/verify/:reference', protect, verifyPayment);

export default router;  // ← ES Module export, not module.exports