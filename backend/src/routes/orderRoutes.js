const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');

// Route to start payment
router.post('/initialize', initializePayment);

// Route for the frontend to check if payment was successful
router.get('/verify/:reference', verifyPayment);

module.exports = router;