// controllers/paymentController.js
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (response.data.data.status === 'success') {
      await prisma.delivery.update({
        where: { paystackRef: reference },
        data:  { status: 'PAID' },
      });

      return res.status(200).json({ 
        status:  'success', 
        message: 'Payment verified!' 
      });
    }

    return res.status(400).json({ 
      status:  'failed', 
      message: 'Payment not confirmed yet' 
    });

  } catch (error) {
    console.error('Verify Error:', error.message);
    return res.status(500).json({ message: 'Verification error' });
  }
};