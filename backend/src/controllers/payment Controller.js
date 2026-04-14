const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// STEP 1: Initialize Payment
exports.initializePayment = async (req, res) => {
  try {
    const { amount, email, metadata } = req.body;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack counts in kobo (multiply by 100)
        callback_url: "http://localhost:5173/payment-success",
        metadata
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// STEP 2: Verify Payment
exports.verifyPayment = async (req, res) => {
  const { reference } = req.params;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (response.data.data.status === 'success') {
      // Logic: Update your Database here (mark order as paid)
      // await prisma.order.update({ ... })
      
      res.json({ status: 'success', data: response.data.data });
    } else {
      res.json({ status: 'failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};